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

router.get("/me", async (req, res) =>{
  try{
    const user_id = req.user.id
    if (!user_id) return res.status(401).json("Kullanıcı Yok")
    
    const {data: user, error} = await supabase.from("users")
    .select()
    .eq("id", user_id)
    .single();

    if (error) throw error
    res.status(200).json(user)
  }catch(error){
    res.status(500).json("Kullanıcı Bilgileri Yanlış ve ya Çekilemedi")
  }
})

export default router;
