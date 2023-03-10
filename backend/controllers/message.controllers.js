import asyncHandler from "express-async-handler";
import ChatModel from "../models/Chat.js";
import Message from "../models/Message.js";
import UserModel from "../models/User.js";

export const sendMessageController = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content, !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    };

    let newMessage = {
        sender: req.user._id,
        content,
        chat: chatId
    };

    try {
        let message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await UserModel.populate(message, {
            path: "chat.users",
            select: "name pic email"
        });

        await ChatModel.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    };
});

export const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    };
});