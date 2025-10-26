import { createClient } from "@supabase/supabase-js";
import { Router } from "express";

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/", async (req, res) => {
  try {
    const { email, password, user_name } = req.body;

    // 1. Önce kendi users tablosuna user_name ve email ekle (id otomatik veya seri olabilir)
    const { data: insertedUsers, error: insertError } = await supabase
      .from("users")
      .insert([{ id : "a",user_name, email }])
      .select(); // eklenen satırı döndür

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    if (!insertedUsers || insertedUsers.length === 0) {
      return res.status(500).json({ error: "Kullanıcı kaydı başarısız" });
    }

    const insertedUser = insertedUsers[0];

    // 2. Supabase Auth ile kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Supabase’den dönen user objesini al
    const user = authData.user || authData;

    if (!user || !user.id) {
      return res.status(500).json({ error: "Supabase kullanıcı ID'si alınamadı" });
    }

    // 3. Supabase’den gelen kullanıcı ID’sini bizim users tablosundaki kayıtla eşleştirip güncelle
    const { error: updateError } = await supabase
      .from("users")
      .update({ id: user.id })
      .eq("email", email);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.status(200).json({ message: "Kayıt başarılı", userId: user.id });
  } catch (error) {
    console.error("Sunucu hatası:", error);
    res.status(500).json({ error: "Sunucu tarafında beklenmeyen hata oluştu." });
  }
});

export default router;
