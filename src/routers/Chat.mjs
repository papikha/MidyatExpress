import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/users", async (req, res) => {
  try {
    const id = req.body.id;
    const { data: rooms, error } = await supabase
      .from("rooms")
      .select()
      .or(`user1_id.eq.${id},user2_id.eq.${id}`);

    if (error) throw error;

    const otherUserIds = rooms.map((room) =>
      room.user1_id === id ? room.user2_id : room.user1_id
    );
    if (otherUserIds.length === 0) return res.json([]);

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("user_name, avatar_url")
      .in("id", otherUserIds);

    if (usersError) throw usersError;
    res.json(usersData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => {
  const user_name = req.query.user_name;
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("user_name, avatar_url, id")
      .ilike("user_name", `%${user_name}%`);
      if (error) throw error;
      res.json(users);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

export default router;
