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

router.get("/me", async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) return res.status(401).json("Kullanıcı Yok");

    const { data: user, error } = await supabase
      .from("users")
      .select()
      .eq("id", user_id)
      .single();

    if (error) throw error;

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(user_id);

    if (authError) throw authError;
    user.email = authUser.user.email;
    user.phone = authUser.user.phone;
    user.phone_confirmed_at = authUser.user.phone_confirmed_at
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json("Kullanıcı Bilgileri Yanlış ve ya Çekilemedi");
  }
});

router.post("/me/changeUserName", async (req, res) => {
  const id = req.user.id;
  if (!req.user.id) return res.sendStatus(401);
  const newUserName = req.body.newUserName;
  const { data, error } = await supabase
    .from("users")
    .update({ user_name: newUserName })
    .eq("id", id);
  if (error) {
    if (error?.code == "23505") {
      return res
        .status(409)
        .json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
    }
    return res.status(500).json({
      error:
        "Kullanıcı adı değiştirilirken bir hata oluştu lütfen daha sonra tekrar deneyiniz.",
    });
  }

  return res
    .status(200)
    .json({ message: "Kullanıcı adınız başarıyla değiştirildi" });
});

router.post("/me/set", async (req, res) => {
  const id = req.user.id;
  if (!req.user.id) return res.sendStatus(401);
  const { name, surname, phone } = req.body;
  if (name && name.length >= 3) {
    const { error } = await supabase
      .from("users")
      .update({ real_name: name.trim() })
      .eq("id", id)
      .is("real_name", null);

    if (error)
      return res
        .status(500)
        .json({ error: error });
    return res.status(200).json({ message: "İsim başarıyla eklendi" });
  } else if (surname && surname.length >= 2) {
    const { error } = await supabase
      .from("users")
      .update({ real_surname: surname.trim() })
      .eq("id", id)
      .is("real_surname", null);

    if (error)
      return res.status(500).json({
        error: "Soyisim eklenenemdi lütfen daha sonra tekrar deneyiniz",
      });
    return res.status(200).json({ message: "Soyisim başarıyla eklendi" });
  } else return res.status(400).json({ error: "Bir hata oluştu" });
});

router.post("/listing", async (req, res) => {
  const { listing_id } = req.body;
  if (!listing_id) return res.status(404).json("İlan Bulunamadı");

  const { data: listingData, error: listingError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listing_id)
    .single();

  if (!listingData || listingError)
    return res.status(404).json("İlan Bulunamadı");

  const { data: sellerData, error: sellerError } = await supabase
    .from("users")
    .select(
      "user_name, real_name, real_surname, avatar_url, last_seen, total_listings",
    )
    .eq("id", listingData.seller_id)
    .single();

  if (!sellerData || sellerError)
    return res.status(404).json("Satıcı bulunamadı");

  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(listingData.seller_id);

  return res.status(200).json({
    ...sellerData,
    created_at: user?.created_at ?? null,
  });
});

export default router;
