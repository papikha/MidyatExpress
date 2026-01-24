import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const upload = multer();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/", upload.single("file"), async (req, res) => {
  const id = req.user.id;
  const role = req.user.role;
  if (!id || role !== "admin") {
    return res.status(403).json("Yetkisiz erişim");
  }
  try {
    const { name, price, stock, description, new_price } = req.body;

    const { data: inserted, error: insertError } = await supabase
      .from("products") //resimsiz ürün çünkü sonra üründe sorun çıkarsa resim buckete gidiyor
      .insert([
        {
          name,
          price,
          new_price: new_price || null,
          stock,
          description,
        },
      ])
      .select("id")
      .single();

    if (insertError) throw insertError;

    let imgUrl = null;

    if (req.file) {
      const key = `${Date.now()}_${req.file.filename}`;
      const { error: uploadError } = await supabase.storage
        .from("product_images")
        .upload(key, req.file.buffer, { contentType: req.file.mimetype });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product_images")
        .getPublicUrl(key);
      imgUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("products")
        .update({ img_url: imgUrl })
        .eq("id", inserted.id);

      if (updateError) throw updateError;
    }

    res.json({ message: "Ürün başarıyla kaydedildi!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
