import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongo_uri);

        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.log(`Error: ${err}`);
    };
};

export { connectDB };