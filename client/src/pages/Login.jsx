import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const { socket, setUsername: setGlobalUsername } = useSocket();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setGlobalUsername(username);
      socket.emit("user_join", username);
      navigate("/chat");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white to-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg p-8 rounded-2xl w-80 text-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Enter Chat</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Join
        </button>
      </form>
    </div>
  );
}
