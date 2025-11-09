import "dotenv/config";
import express from "express";
import HomeRouter from "./src/routers/Home.mjs"
import UsersRouter from "./src/routers/users.mjs"
import PanelRouter from "./src/routers/Panel.mjs"
import ProfileRouter from "./src/routers/Profile.mjs"
import ChatRouter, { newChat } from "./src/routers/Chat.mjs"
import http from "http";

const app = express();
app.use(express.json())

app.use("/api/products", HomeRouter);
app.use("/api/users", UsersRouter);
app.use("/api/panel", PanelRouter);
app.use("/api/profile", ProfileRouter)
app.use("/api/chat", ChatRouter);

const port = process.env.PORT || 8000;

const server = http.createServer(app);
newChat(server)
server.listen(port, () => console.log(`Hoppa - ${port} V2`));