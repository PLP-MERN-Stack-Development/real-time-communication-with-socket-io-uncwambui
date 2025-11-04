// src/components/ChatBox.jsx
import { useEffect, useState, useRef } from "react";
import Message from "./Message";

export default function ChatBox({
  socket,
  currentUser,
  activeChat,
  messages,
  onSendMessage,
  onReact,
  typingUsers,
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { room: activeChat?.room, isTyping: input.length > 0 });
  };

  return (
    <div className="flex flex-col flex-grow bg-white p-4">
      <div className="flex-grow overflow-y-auto">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            msg={msg}
            currentUser={currentUser}
            onReact={onReact}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="text-sm text-gray-500 mt-1">
        {typingUsers.length > 0 && `${typingUsers.join(", ")} is typing...`}
      </div>
      <form onSubmit={handleSubmit} className="flex mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={handleTyping}
          placeholder="Type a message..."
          className="flex-grow border rounded-md p-2"
        />
        <button className="ml-2 bg-blue-500 text-white px-4 rounded-md hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
}
