import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const upload = multer();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { name, price, stock, description, new_price } = req.body;

    let imgUrl = null;
    if (req.file) {
      const key = `${Date.now()}_${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("product_images")
        .upload(key, req.file.buffer, { contentType: req.file.mimetype });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product_images")
        .getPublicUrl(key);
      imgUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase
      .from("products")
      .insert([
        {
          name,
          price,
          new_price: new_price || null,
          stock,
          description,
          img_url: imgUrl,
        },
      ]);

    if (insertError) throw insertError;

    res.json({ message: "Ürün başarıyla kaydedildi!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
