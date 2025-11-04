import React from "react";
import { useSocket } from "../context/SocketContext";

const reactions = ["👍", "❤️", "😂", "🔥"];

const Message = ({ msg }) => {
  const { socket, username } = useSocket();

  const handleReact = (emoji) => {
    socket.emit("react_message", {
      messageId: msg.id,
      reaction: emoji,
      room: msg.room,
    });
  };

  const handleRead = () => {
    socket.emit("read_message", { messageId: msg.id, room: msg.room });
  };

  return (
    <div
      className={`message ${msg.sender === username ? "own" : ""}`}
      onMouseEnter={handleRead}
    >
      <p>
        <strong>{msg.sender}</strong>: {msg.message}
      </p>
      <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
      <div className="reactions">
        {reactions.map((r) => (
          <button key={r} onClick={() => handleReact(r)}>
            {r}
          </button>
        ))}
      </div>
      {msg.reactions && (
        <div className="reaction-summary">
          {Object.entries(msg.reactions).map(([emoji, users]) => (
            <span key={emoji}>
              {emoji} {users.length}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Message;
