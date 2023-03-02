import express from "express";
import config from "./config/config.js";
import { connectDB } from "./config/db.js";

const app = express();
connectDB();

app.listen(config.port, console.log(`Server is running in port ${config.port}`));