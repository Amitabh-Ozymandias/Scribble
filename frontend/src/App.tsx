import { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
  socket.on("connect", () => {
    console.log("Connected");

    setSocketId(socket.id!);

    socket.emit("create-room", "Amit");
  });

  socket.on("room-created", (room) => {
    console.log("Room Created:", room);
  });

  socket.on("room-updated", (room) => {
    console.log("Room Updated:", room);
  });

  return () => {
    socket.off("connect");
    socket.off("room-created");
    socket.off("room-updated");
  };
}, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "28px",
      }}
    >
      Socket ID:
      <br />
      {socketId}
    </div>
  );
}

export default App;