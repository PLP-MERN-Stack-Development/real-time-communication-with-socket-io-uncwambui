// src/pages/ChatRoom.jsx
import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import UserList from "../components/UserList";
import socket from "../socket/socket";

export default function ChatRoom({ username }) {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    socket.emit("user_join", username);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message_updated", (msg) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? msg : m))
      );
    });

    socket.on("user_list", setUsers);
    socket.on("typing_users", setTypingUsers);

    return () => {
      socket.off("receive_message");
      socket.off("message_updated");
      socket.off("user_list");
      socket.off("typing_users");
    };
  }, [username]);

  const sendMessage = (message) => {
    socket.emit("send_message", { message }, () => {
      console.log("Delivered!");
    });
  };

  const reactToMessage = (messageId, reaction) => {
    socket.emit("message_reaction", { messageId, reaction });
  };

  return (
    <div className="flex h-screen">
      <UserList
        users={users}
        currentUser={username}
        onPrivateChat={(user) => alert(`Start private chat with ${user.username}`)}
      />
      <ChatBox
        socket={socket}
        currentUser={username}
        activeChat={{ room: "global" }}
        messages={messages}
        onSendMessage={sendMessage}
        onReact={reactToMessage}
        typingUsers={typingUsers}
      />
    </div>
  );
}
