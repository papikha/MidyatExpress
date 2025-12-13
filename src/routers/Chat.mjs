import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/addRoom", async (req, res) => {
  try {
    const { user1_id, user2_id } = req.body;
    const { data, error } = await supabase.from("rooms").insert({
      user1_id,
      user2_id,
    });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

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
      .select("id, user_name, avatar_url, is_online, last_seen")
      .in("id", otherUserIds);

    if (usersError) throw usersError;
    res.json(usersData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/sendMessage", async (req, res) => {
  try {
    const { room, message, sender_id } = req.body;

    const { count, error: countError } = await supabase
      .from("chats")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room);

    if (countError) throw countError;

    if (count >= 150) {
      const { error: deleteError } = await supabase
        .from("chats")
        .delete()
        .eq("room_id", room)
        .order("created_at", { ascending: true })
        .limit(1);

      if (deleteError) throw deleteError;
    }

    const { data, error } = await supabase.from("chats").insert({
      room_id: room,
      message,
      sender_id,
    });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
});

router.post("/getMessages", async (req, res) => {
  try {
    const { room } = req.body;
    const { data, error } = await supabase
      .from("chats")
      .select()
      .eq("room_id", room);
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
});

router.post("/setOnline", async (req, res) => {
  const { is_online, last_seen, id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    let updateData = { is_online };

    if (!is_online && last_seen) {
      updateData.last_seen = last_seen;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.log("Supabase update error:", error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search", async (req, res) => {
  const user_name = req.query.user_name;
  if (user_name.length < 3) return res.send();
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
