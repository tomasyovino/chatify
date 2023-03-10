import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { sendMessageController, allMessages } from "../controllers/message.controllers.js";

const messageRouter = Router();

messageRouter.route("/").post(protect, sendMessageController);
messageRouter.route("/:chatId").get(protect, allMessages);

export default messageRouter;