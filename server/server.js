// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let users = {};
let messages = [];
let typingUsers = {};
let reactions = {};

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Handle user join
  socket.on("user_join", (username) => {
    users[socket.id] = username;
    console.log(`${username} joined`);
    io.emit("user_list", Object.values(users));
  });

  // Join room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`${users[socket.id]} joined room ${room}`);
  });

  // Send message
  socket.on("send_message", (data) => {
    const message = {
      id: Date.now(),
      sender: users[socket.id],
      message: data.message,
      timestamp: new Date(),
      room: data.room || "general",
      reactions: {},
    };

    messages.push(message);

    // Emit to everyone in that room
    io.to(message.room).emit("receive_message", message);
  });

  // Handle typing indicator
  socket.on("typing", ({ room, isTyping }) => {
    const username = users[socket.id];
    if (!username) return;

    if (isTyping) {
      typingUsers[username] = true;
    } else {
      delete typingUsers[username];
    }

    io.to(room).emit("typing_users", Object.keys(typingUsers));
  });

  // Handle reactions
  socket.on("react_message", ({ messageId, reaction, room }) => {
    const username = users[socket.id];
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    if (!message.reactions[reaction]) message.reactions[reaction] = [];
    if (!message.reactions[reaction].includes(username))
      message.reactions[reaction].push(username);

    io.to(room).emit("receive_reaction", { messageId, reactions: message.reactions });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const username = users[socket.id];
    console.log(`${username} disconnected`);
    delete users[socket.id];
    io.emit("user_list", Object.values(users));
  });
});

server.listen(5000, () => console.log("✅ Server running on port 5000"));
