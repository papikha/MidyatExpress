import "dotenv/config";
import express from "express";
import HomeRouter from "./src/routers/Home.mjs"
import RegisterRouter from "./src/routers/register.mjs"

const app = express();
app.use(express.json());

app.use("/api/products", HomeRouter);
app.use("/api/register", RegisterRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Hoppa - ${port} V2`));