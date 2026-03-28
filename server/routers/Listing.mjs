import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
import multer from "multer";
import rateLimit from 'express-rate-limit';

const addListingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { error: "Dakikada yalnızca 1 ilan ekleyebilirsiniz" },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const upload = multer();

router.post("/addlisting",addListingLimiter,  upload.array("images", 5), async (req, res) => {
  try {
    const id = req.user.id;
    const { title, description, price } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      title.length < 10 ||
      title.length > 40 ||
      description.length < 100 ||
      description.length > 400 ||
      Number(price) < 0
    ) {
      return res.status(200).json({
        error: "Başlık ve açıklamayı doğru yazdığınızdan emin olun",
      });
    }

    const {
      data: { listing_quota },
      error: LİstingQuotaError,
    } = await supabase
      .from("users")
      .select("listing_quota")
      .eq("id", id)
      .single();
    if (LİstingQuotaError) {
      return res.status(500).json({ error: "bir sorun oluştu" });
    }
    if (listing_quota < 1) {
      return res.status(200).json({ error: "İlan ekleme hakkınız bulunmuyor" });
    }

    const { data: insertedListing, error: addlistingError } = await supabase
      .from("listings")
      .insert([
        {
          seller_id: id,
          listing_name: title,
          listing_price: price,
          listing_description: description,
        },
      ])
      .select("id")
      .single();

    if (addlistingError) {
      return res.status(500).json({
        error: "İlan eklenirken bir sorun oluştu",
      });
    }

    let imagePaths = {};

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const key = `${insertedListing.id}_${Date.now()}_${i}`;

        const { error: uploadError } = await supabase.storage
          .from("Listings")
          .upload(key, file.buffer, {
            contentType: file.mimetype,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("Listings").getPublicUrl(key);

        imagePaths[`i${i + 1}`] = data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("listings")
        .update({ image_paths: imagePaths })
        .eq("id", insertedListing.id);

      if (updateError) throw updateError;
    }

    const { data: quotaUpdate, error:quotaUpdateError } = await supabase
      .from("users")
      .update({ listing_quota: listing_quota - 1 })
      .eq("id", id)
      .gt("listing_quota", 0)
      .select();

      
if (quotaUpdateError) {
  return res.status(500).json({ error: "Kota güncellenemedi" });
}

if (!quotaUpdate || quotaUpdate.length === 0) {
  return res.status(200).json({
    error: "İlan hakkınız kalmamış",
  });
}

    res.status(200).json({ message: "İlan başarıyla oluşturuldu!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası oluştu" });
  }
});

export default router;
