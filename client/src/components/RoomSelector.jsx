import React from "react";
import { useSocket } from "../context/SocketContext";

const rooms = ["general", "random", "tech", "announcements"];

const RoomSelector = ({ room, setRoom }) => {
  const { socket } = useSocket();

  const changeRoom = (r) => {
    setRoom(r);
    socket.emit("join_room", r);
  };

  return (
    <div className="room-selector">
      {rooms.map((r) => (
        <button
          key={r}
          className={r === room ? "active" : ""}
          onClick={() => changeRoom(r)}
        >
          #{r}
        </button>
      ))}
    </div>
  );
};

export default RoomSelector;
