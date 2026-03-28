import express from "express";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";
import rateLimit from "express-rate-limit";

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator: (req) => req.user.id,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Lütfen biraz bekleyin",
  },
});

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

router.post("/set_phone", async (req, res) => {
  const id = req.user.id;
  if (!id) return res.statusCode(401);
  const phone = req.body.phone;
  if (!phone || !phone.startsWith("5") || phone.length !== 10) {
    return res.status(400).json({ error: "Telefon numarası hatalı" });
  }

  const {
    data: { user },
    error: getError,
  } = await supabase.auth.admin.getUserById(id);
  if (user.phone)
    return res
      .status(400)
      .json({ error: "Zaten telefon numaran var, onu doğrula!" });

  const { data, error } = await supabase.auth.admin.updateUserById(id, {
    phone: `+90${phone}`,
  });
  if (error)
    return res
      .status(500)
      .json({ error: "Bir hata oluştu lütfen daha sonra tekrar deneyiniz" });
  return res
    .status(200)
    .json({ message: "Telefon numarası başarıyla eklendi" });
});

router.get("/send_code", verifyLimiter, async (req, res) => {
  const receiverId = req.user.id;
  if (!receiverId) return res.sendStatus(403);
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(receiverId);
  const receiver_phone = "+" + user.phone;
  if (!receiver_phone || receiver_phone.length !== 13) {
    return res.status(400).json({ error: "Telefon numarası bulunamadı" });
  }

  const { data: getData, error: getError } = await supabase
    .from("phone_codes")
    .select("receiver_id")
    .eq("receiver_id", receiverId);
  if (getError) {
    return res.status(500).json({
      error: "Bilinmeyen bir hata oluştu lütfen daha sonra tekrar deneyiniz",
    });
  }
  if (getData.length >= 3) {
    return res.status(400).json({
      error: "deneme haklarınız tükendi, sıfırlanması için 3 gün bekleyiniz",
    });
  }

  //random kod generator
  let randomCode = "";
  for (let i = 0; i < 6; i++) {
    randomCode = randomCode + Math.floor(Math.random() * 10);
  }

  const { data: postData, error: postError } = await supabase
    .from("phone_codes")
    .insert({ receiver_id: receiverId, code: randomCode });
  if (postError)
    return res.status(500).json({
      error: postError,
    });
    console.log("+"+ receiver_phone)
  const message = await client.messages.create({
    body: randomCode,
    from: process.env.TWILIO_FROM_NUMBER,
    to: receiver_phone,
  });
  
  return res.status(200).json({ message: "Kod gönderildi" })
});

router.post("/verify_phone", async (req, res) => {
  const id = req.user.id;
  if (!id) return res.sendStatus(403);
  const code = req.body.code;
  if (!code || code.length !== 6) {
    return res.status(400).json({ error: "Lütfen 6 haneli bir kod giriniz" });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.admin.getUserById(id);

  if (!user.phone || user.phone.length !== 12) {
    return res.status(400).json({ error: "Telefon numarası yok" });
  }

  const { data: codeData, error } = await supabase
    .from("phone_codes")
    .select()
    .eq("receiver_id", id)
    .gte(
      "created_at",
      new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 dk
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return res
      .status(500)
      .json({ error: "Bir hata oluştu lütfen daha sonra tekrar deneyiniz" });
  }

  if (!codeData || codeData.code !== code) {
    return res.status(400).json({ error: "Hatalı kod" });
  }

  if (codeData.code == code) {
    const { data, error } = await supabase
      .from("users")
      .update({ is_phone_confirmed: true })
      .eq("id", id)
    if (error) {
      return res
        .status(500)
        .json({ error: error });
    }
    return res
      .status(200)
      .json({ message: "Telefon numaranız başarıyla onaylandı tebrikler" });
  }
});

export default router;
