import { Router } from "express";
import { registerUser, authUser } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.route("/").post(registerUser);
userRouter.post("/login", authUser);

export default userRouter;