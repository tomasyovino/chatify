import jwt from "jsonwebtoken";
import config from "./config.js";

const generateToken = (id) => {
    return jwt.sign({ id }, config.jwt_secret, {
        expiresIn: "30d",
    });
};

export default generateToken;