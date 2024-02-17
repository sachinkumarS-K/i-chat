import app from "./app.js";
import "dotenv/config.js";
import http from "http";
import colors from "colors";
import { Server } from "socket.io";
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://talkandhub.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connection");
  });
  socket.on("disconnect", () => {
    console.log("client dissconnected".america.strikethrough);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined Room : ", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessage) => {
    let chat = newMessage.chat;
    if (!chat.users) return console.log("user not defined");

    chat.users.map((u) => {
      if (u._id == newMessage.sender._id) return;
      socket.in(u._id).emit("message recieved", newMessage);
    });
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is listining to port : ${process.env.PORT}`.rainbow);
});
