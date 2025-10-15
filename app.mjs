import "dotenv/config";
import express from "express";
import apiRouter from "./routes/api.mjs";

const app = express();

const port = process.env.PORT || 8000;

app.listen(port => console.log("Hoppa-8000 V2"));