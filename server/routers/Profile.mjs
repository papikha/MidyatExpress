import { Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ message: "Kullanıcı ID eksik" });

    // Kullanıcının avatar_urlini al
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (fetchError)
      return res.status(500).json({ message: "Kullanıcı bulunamadı" });
    if (user?.avatar_url) {
      // Storage path çıkar
      const oldPath = user.avatar_url.split("/avatar_images/")[1];
      if (oldPath) {
        const { error: removeError } = await supabase.storage
          .from("avatar_images")
          .remove([oldPath]);
        if (removeError)
          console.warn("Eski avatar silinemedi:", removeError.message);
      }
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (updateError)
      return res.status(500).json({ message: "Avatar URL güncellenemedi" });

    res.json({ message: "Avatar silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

router.post("/", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId || !req.file) return res.status(400).send("Eksik veri");

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (userError) return res.status(500).send("Kullanıcı bulunamadı");

    const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
    const filePath = fileName; // sadece dosya adı, bucket zaten "avatar_images"
    await supabase.storage
      .from("avatar_images")
      .upload(filePath, req.file.buffer, {
        upsert: true,
        contentType: req.file.mimetype,
      });

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatar_images").getPublicUrl(filePath);

    await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    res.json({ message: "Avatar değiştirildi", avatar_url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Sunucu hatası");
  }
});

export default router;
