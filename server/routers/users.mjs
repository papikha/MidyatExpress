import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  try {
    const { email, password, user_name } = req.body;

    if (
      !email ||
      !password ||
      !user_name ||
      !emailRegex.test(email) ||
      password.length < 8 ||
      user_name.length < 3 ||
      user_name.length > 20
    ) {
      return res.status(400).json({ error: "Kayıt başarısız" });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error || !data?.user?.id) {
      return res.status(400).json({ error: "Kayıt başarısız" });
    }

    const userId = data.user.id;

    const { error: insertError } = await supabase
      .from("users")
      .insert([{ id: userId, email, user_name }]);

    if (insertError) {
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: "Kayıt başarısız" });
    }

    res.status(201).json({ message: "Kayıt başarılı" });
  } catch {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

export default router;
