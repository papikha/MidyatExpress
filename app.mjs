import "dotenv/config";
import express from "express";
import HomeRouter from "./src/routers/Home.mjs";
import UsersRouter from "./src/routers/users.mjs";
import PanelRouter from "./src/routers/Panel.mjs";
import ProfileRouter from "./src/routers/Profile.mjs";
import ChatRouter from "./src/routers/Chat.mjs";
import CartRouter from "./src/routers/Cart.mjs";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.use(express.json());

app.use("/api/products", HomeRouter);
app.use("/api/users", UsersRouter);
app.use("/api/panel", PanelRouter);
app.use("/api/profile", ProfileRouter);
app.use("/api/chat", ChatRouter);
app.use("/api/cart", CartRouter);

const port = process.env.PORT || 8000;

io.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", ({ room, message, sender_id }) => {
    io.to(room).emit("receive_message", {
      message,
      sender_id,
      timestamp: new Date().toISOString(),
    });
  });
});

server.listen(port, () => console.log(`Hoppa - ${port} V2`));
