import { createClient } from "@supabase/supabase-js";
import { Router } from "express";

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message || error });
    }

    res.json(data || []);
  } catch (err) {
    console.error("Server catch hatası:", err);
    res.status(500).json({ error: err.message || err });
  }
});

export default router;
