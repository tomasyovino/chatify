import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } from "../controllers/chat.controllers.js";

const chatRouter = Router();

chatRouter.route("/")
    .post(protect, accessChat)
    .get(protect, fetchChats);

chatRouter.route("/group")
    .post(protect, createGroupChat);

chatRouter.route("/rename")
    .put(protect, renameGroup);

chatRouter.route("/groupadd")
    .put(protect, addToGroup);

chatRouter.route("/groupremove")
    .put(protect, removeFromGroup);


export default chatRouter;