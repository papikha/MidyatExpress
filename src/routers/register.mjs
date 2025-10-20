import { createClient } from "@supabase/supabase-js";
import { Router } from "express";

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/", async (req, res) => {
  console.log(req.body)
  try {
    const { user_name, email} = req.body;

    if (user_name || email) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ user_name, email}]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message || error });
    }

    res.status(201).json({ message: "Kayıt başarılı", data });
  } catch (err) {
    console.error("Server catch hatası:", err);
    res.status(500).json({ error: err.message || err });
  }
});

export default router;
