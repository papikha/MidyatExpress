import { createClient } from "@supabase/supabase-js";
import { Router } from "express";

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/", async (req, res) => {
  try {
    const id = req.user.id

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "user id gerekli",
      });
    }

    const { data, error } = await supabase
      .from("carts")
      .select(
        `
        quantity,
        products (
          id,
          name,
          img_url,
          stock,
          price,
          new_price,
          description
        )
      `
      )
      .eq("user_id", id);

    if (error) throw error;

    const formattedProducts = data.map((item) => ({
      product_id: item.products.id,
      name: item.products.name,
      img_url: item.products.img_url,
      stock: item.products.stock,
      price: item.products.price,
      new_price: item.products.new_price,
      desciption: item.products.description,
      quantity: item.quantity,
    }));

    return res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Cart API error:", error);
    return res.status(500).json({
      success: false,
      error: "Sepet ürünleri alınamadı",
    });
  }
});

router.post("/remove", async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id
    const { data, error } = await supabase
      .from("carts")
      .delete()
      .eq("product_id", product_id)
      .eq("user_id", user_id);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("ürün silme hatası :" + error);
    res.status(500).json({ error });
  }
});

router.post("/iord", async (req, res) => {
  try {
    const { product_id, increase } = req.body;
    const user_id = req.user.id

    if (!product_id || !user_id) {
      return res.status(400).json({ message: "Eksik veri" });
    }

    const { data, error } = await supabase
      .from("carts")
      .select("quantity")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single();

    //insert
    if (error && error.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("carts")
        .insert([{ product_id, user_id, quantity: 1 }]);

      if (insertError) throw insertError;

      return res.json({ quantity: 1 });
    }

    if (error) throw error;

    const newQuantity = increase ? data.quantity + 1 : data.quantity - 1;

    //delete 0 sa
    if (newQuantity <= 0) {
      await supabase
        .from("carts")
        .delete()
        .eq("user_id", user_id)
        .eq("product_id", product_id);

      return res.json({ quantity: 0 });
    }

    //update
    await supabase
      .from("carts")
      .update({ quantity: newQuantity })
      .eq("user_id", user_id)
      .eq("product_id", product_id);

    return res.json({ quantity: newQuantity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sepet güncelleme hatası" });
  }
});

router.post("/thisProduct", async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id

    if (!product_id || !user_id) {
      return res.status(400).json({ quantity: 0 });
    }

    const { data, error } = await supabase
      .from("carts")
      .select("quantity")
      .eq("user_id", user_id)
      .eq("product_id", Number(product_id))
      .maybeSingle();

    if (!data) {
      return res.json({ quantity: 0 });
    }

    return res.json({ quantity: data.quantity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ quantity: 0 });
  }
});

export default router;
