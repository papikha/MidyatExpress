import "dotenv/config";
import express from "express";
import HomeRouter from "./src/routers/Home.mjs"
import UsersRouter from "./src/routers/users.mjs"
import PanelRouter from "./src/routers/Panel.mjs"
import ProfileRouter from "./src/routers/Profile.mjs"

const app = express();
app.use(express.json())

app.use("/api/products", HomeRouter);
app.use("/api/users", UsersRouter);
app.use("/api/panel", PanelRouter);
app.use("/api/profile", ProfileRouter)

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Hoppa - ${port} V2`));