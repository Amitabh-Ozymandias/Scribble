import { useState } from "react";
import { socket } from "../socket";

export default function Lobby() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    if (!name.trim()) return;

    socket.emit("create-room", name);
  };

  const joinRoom = () => {
    if (!name.trim() || !roomId.trim()) return;

    socket.emit("join-room", {
      roomId: roomId.toUpperCase(),
      playerName: name,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "300px",
        margin: "100px auto",
      }}
    >
      <h1>Scribble</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={createRoom}>
        Create Room
      </button>

      <input
        placeholder="Room Code"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}