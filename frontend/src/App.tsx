import { useEffect } from "react";
import { socket } from "./socket";
import Lobby from "./components/Lobby.tsx";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("room-created", (room) => {
      console.log("Room Created:", room);
    });

    socket.on("room-updated", (room) => {
      console.log("Room Updated:", room);
    });

    socket.on("room-error", (message) => {
      console.error(message);
    });

    return () => {
      socket.off("connect");
      socket.off("room-created");
      socket.off("room-updated");
      socket.off("room-error");
    };
  }, []);

  return <Lobby />;
}

export default App;