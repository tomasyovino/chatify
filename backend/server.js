import express from "express";
import config from "./config/config.js";
import { connectDB } from "./config/db.js";
import router from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { Server as WebSocketServer } from "socket.io";

const app = express();
connectDB();

app.use(express.json());
app.use("/api", router);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, console.log(`Server is running in port ${config.port}`));

const io = new WebSocketServer(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id)
        socket.emit("connected")
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        let chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users is not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id)
    })
});