import { Router } from "express";
import { registerUser, authUser, allUsers } from "../controllers/user.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/")
    .post(registerUser)
    .get(protect, allUsers);

userRouter.post("/login", authUser);


export default userRouter;