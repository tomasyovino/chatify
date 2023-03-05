import express from "express";
import config from "./config/config.js";
import { connectDB } from "./config/db.js";
import router from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();
connectDB();

app.use(express.json());
app.use("/api", router);
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, console.log(`Server is running in port ${config.port}`));