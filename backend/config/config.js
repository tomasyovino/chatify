import dotenv from "dotenv";
dotenv.config();

const config = {
    port: process.env.PORT,
    mongo_uri: process.env.MONGO_URI,
    jwt_secret: process.env.JWT_SECRET,
    node_env: process.env.NODE_ENV
};

export default config;