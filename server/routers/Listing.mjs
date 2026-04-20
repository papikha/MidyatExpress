import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";

const addListingLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 1,
  message: { error: "30 saniyede bir ilan işleminde bulunabilirsiniz" },
  standardHeaders: true,
  legacyHeaders: false,
});

const seeListingLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const upload = multer();

const deleteEmptyQ_as = (q_as) => {
  const finalQ_as = Object.fromEntries(
    Object.entries(q_as).filter(
      ([, value]) => value.q.trim() !== "" && value.a.trim() !== "",
    ),
  );

  return finalQ_as;
};

router.post(
  "/addlisting",
  addListingLimiter,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const id = req.user.id;
      const { title, description, price, category, jsonStringfyQ_a } = req.body;
      const q_a = deleteEmptyQ_as(JSON.parse(jsonStringfyQ_a));
      const categories = [
        "real_estate",
        "vehicles",
        "spare_parts",
        "second-hand",
        "industry",
        "job_listings",
        "animals",
        "hobbies_entertainment",
        "fashion",
        "home_living",
      ];

      if (
        !title ||
        !description ||
        !price ||
        !category ||
        title.length < 10 ||
        title.length > 50 ||
        description.length < 100 ||
        description.length > 500 ||
        Number(price) < 0 ||
        !categories.includes(category)
      ) {
        return res.status(400).json({
          error: "Formdaki bilgileri doğru girdiğinizden emin olun",
        });
      }

      for (const QA of Object.values(q_a)) {
        for (const text of Object.values(QA)) {
          if (
            typeof text !== "string" ||
            text.trim().length < 10 ||
            text.trim().length > 250
          ) {
            return res.status(400).json({
              error: "Formdaki bilgileri doğru girdiğinizden emin olun",
            });
          }
        }
      }

      const {
        data: { listing_quota },
        error: ListingQuotaError,
      } = await supabase
        .from("users")
        .select("listing_quota")
        .eq("id", id)
        .single();
      if (ListingQuotaError) {
        return res.status(500).json({ error: "bir sorun oluştu" });
      }
      if (listing_quota < 1) {
        return res
          .status(400)
          .json({ error: "İlan ekleme hakkınız bulunmuyor" });
      }

      const { data: insertedListing, error: addlistingError } = await supabase
        .from("listings")
        .insert([
          {
            seller_id: id,
            listing_name: title,
            listing_price: price,
            listing_description: description,
            category: category,
            q_a: q_a,
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

      const { data: quotaUpdate, error: quotaUpdateError } = await supabase
        .from("users")
        .update({ listing_quota: listing_quota - 1 })
        .eq("id", id)
        .gt("listing_quota", 0)
        .select();

      if (quotaUpdateError) {
        return res.status(500).json({ error: "Kota güncellenemedi" });
      }

      if (!quotaUpdate || quotaUpdate.length === 0) {
        return res.status(400).json({
          error: "İlan hakkınız kalmamış",
        });
      }

      res.status(200).json({ message: "İlan başarıyla oluşturuldu!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası oluştu" });
    }
  },
);

router.patch("/increaseseen/:id", seeListingLimiter,  async (req, res) => {
  const id = req.user.id;
  if (!id) return res.sendStatus(403);
  const listing_id = req.params.id;

  const { data: seenData, error: seenGetError } = await supabase
    .from("listings")
    .select("seen, seller_id")
    .eq("id", listing_id)
    .single();

  if (seenData.seller_id == id) return res.sendStatus(200);
  
  const { data, error } = await supabase
    .from("listings")
    .update({ seen: seenData.seen + 1 })
    .eq("id", listing_id)
    .single();
    return res.sendStatus(200);

});

export default router;
