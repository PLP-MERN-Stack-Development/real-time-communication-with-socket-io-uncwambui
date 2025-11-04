import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import TypingIndicator from "./TypingIndicator";
import Message from "./Message";
import RoomSelector from "./RoomSelector";

const ChatRoom = () => {
  const { socket, username, onlineUsers } = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("general");
  const [typingUsers, setTypingUsers] = useState([]);

  // Listen for messages
useEffect(() => {
  if (!socket) return;

  socket.emit("join_room", room);

  socket.on("receive_message", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  socket.on("receive_reaction", ({ messageId, reactions }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, reactions } : msg
      )
    );
  });


  socket.on("typing_users", setTypingUsers);

  return () => {
    socket.off("receive_message");
    socket.off("receive_reaction");
    socket.off("typing_users");
  };
}, [socket, room]);

  // Send message
const sendMessage = () => {
  if (message.trim() === "") return;
  socket.emit("send_message", { message, room });
  setMessage("");
};

  // Typing indicator
  useEffect(() => {
    if (!socket) return;
    if (message.trim().length > 0) socket.emit("typing", { room, isTyping: true });
    else socket.emit("typing", { room, isTyping: false });
  }, [message]);

  return (
    <div className="chat-container">
      <RoomSelector room={room} setRoom={setRoom} />
      <div className="chat-header">
        <h2>Room: {room}</h2>
        <p>Online: {onlineUsers.length}</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
      </div>

      <TypingIndicator typingUsers={typingUsers} currentUser={username} />

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
