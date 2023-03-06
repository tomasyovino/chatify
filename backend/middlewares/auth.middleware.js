import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import asyncHandler from "express-async-handler";
import config from "../config/config.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, config.jwt_secret);

            req.user = await UserModel.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed")
        };
    };
});