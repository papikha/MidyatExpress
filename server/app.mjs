import "dotenv/config";
import express from "express";
import helmet from "helmet";
import UsersRouter from "./routers/users.mjs";
import PanelRouter from "./routers/Panel.mjs";
import ProfileRouter from "./routers/Profile.mjs";
import ChatRouter from "./routers/Chat.mjs";
import CartRouter from "./routers/Cart.mjs";
import { Server } from "socket.io";
import { createServer } from "http";
import rateLimiter from "./middleware/rateLimiter.mjs";
import { getUserId } from "./middleware/getUserId.mjs";
import { socketAuth } from "./middleware/socketAuth.mjs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// middlewares
app.set("trust proxy", 1);
app.use(express.json());
app.use(helmet());
app.use("/api/users/register", rateLimiter);
app.use("/api/users/login", rateLimiter);
app.use("/api/users/me/changeUserName", rateLimiter);
app.use(getUserId)
io.use(socketAuth);

// routers
app.use("/api/users", UsersRouter);
app.use("/api/panel", PanelRouter);
app.use("/api/profile", ProfileRouter);
app.use("/api/chat", ChatRouter);
app.use("/api/cart", CartRouter);

const port = process.env.PORT || 8000;

io.on("connection", (socket) => {

  socket.on("join_room", (room) => {
    const users = room.split("_");
    if (!users.includes(socket.userId)) return;

    socket.join(room);
  });

  socket.on("send_message", ({ room, message }) => {
    if (!room || !message) return;

    io.to(room).emit("receive_message", {
      room,
      message,
      sender_id: socket.userId,
      created_at: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
  });
});

server.listen(port, () => console.log(`Hoppa - ${port} V2`));
