import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
import { Server } from "socket.io";
const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

export function newChat(server) {
  const io = new Server(server)
  io.on("connection", (socket) => {
    
  });
}

export default router