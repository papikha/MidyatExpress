import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

router.post("/users", async (req, res) => {
  try {
    const id = req.user.id;
    const { data: rooms, error } = await supabase
      .from("rooms")
      .select()
      .or(`user1_id.eq.${id},user2_id.eq.${id}`);

    if (error) throw error;

    const otherUserIds = rooms.map((room) =>
      room.user1_id === id ? room.user2_id : room.user1_id,
    );
    if (otherUserIds.length === 0) return res.json([]);

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, user_name, avatar_url, is_online, last_seen")
      .in("id", otherUserIds);

    const newUsersData = usersData.map((u) => {
      const room = rooms.find(
        (room) => u.id === room.user1_id || u.id === room.user2_id,
      );

      return {
        ...u,
        last_message: room?.last_message ?? "",
      };
    });

    if (usersError) throw usersError;
    res.json(newUsersData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/sendMessage", async (req, res) => {
  try {
    const { room, message } = req.body;
    const sender_id = req.user.id;

    const ids = room.split("_");
    if (ids.length !== 2) {
      return res.status(400).json({ message: "room formatı geçersiz" });
    }

    const [userA, userB] = ids;
    if (sender_id !== userA && sender_id !== userB) {
      return res.status(403).json({ message: "Yetkisiz oda" });
    }

    const { error: chatError } = await supabase.from("chats").insert({
      room_id: room,
      message,
      sender_id,
    });
    if (chatError) throw chatError;

    const { data: existingRoom, error: selectError } = await supabase
      .from("rooms")
      .select("id")
      .or(
        `and(user1_id.eq.${userA},user2_id.eq.${userB}), and(user1_id.eq.${userB},user2_id.eq.${userA})`,
      )
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingRoom) {
      const { error: updateError } = await supabase
        .from("rooms")
        .update({ last_message: message })
        .eq("id", existingRoom.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("rooms").insert({
        user1_id: userA,
        user2_id: userB,
        last_message: message,
      });

      if (insertError) throw insertError;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
});

router.post("/getMessages", async (req, res) => {
  try {
    const { room } = req.body;
    const ids = room.split("_");
    if (!ids.includes(req.user.id)) {
      return res.status(403).json({ message: "Yetkisiz" });
    }

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

router.get("/search", async (req, res) => {
  const user_name = req.query.user_name;
  if (user_name.length < 3) return res.send();
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("user_name, avatar_url, id")
      .ilike("user_name", `%${user_name}%`)
      .limit(25);
    if (error) throw error;
    res.json(users);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post("/heartbeat", async (req, res) => {
  if (!req.user?.id) return res.sendStatus(204);

  await supabase
    .from("users")
    .update({
      is_online: true,
      last_seen: new Date().toISOString(),
    })
    .eq("id", req.user.id);

  res.sendStatus(204);
});

export default router;
