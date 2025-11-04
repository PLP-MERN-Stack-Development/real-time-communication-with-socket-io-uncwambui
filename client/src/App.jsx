import React, { useState } from "react";
import { useSocket } from "./context/SocketContext";
import ChatRoom from "./components/ChatRoom";

const App = () => {
  const { socket, setUsername, username } = useSocket();
  const [input, setInput] = useState("");

  const handleJoin = () => {
    if (input.trim() === "") return;
    setUsername(input);
    socket.emit("user_join", input);
  };

  if (!username)
    return (
      <div className="login-screen">
        <h2>Enter username to join</h2>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleJoin}>Join Chat</button>
      </div>
    );

  return <ChatRoom />;
};

export default App;
