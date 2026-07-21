import { useEffect, useState } from "react";
import Lobby from "./components/Lobby.tsx";
import Room from "./components/Room.tsx";
import { socket } from "./socket";

export type Player = {
  id: string;
  name: string;
};

export type RoomType = {
  id: string;
  hostId: string;
  players: Player[];
};

function App() {
  const [room, setRoom] = useState<RoomType | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("room-created", (room: RoomType) => {
      console.log("Room Created:", room);
      setRoom(room);
    });

    socket.on("room-updated", (room: RoomType) => {
      console.log("Room Updated:", room);
      setRoom(room);
    });

    socket.on("room-error", (message: string) => {
      alert(message);
    });

    return () => {
      socket.off("connect");
      socket.off("room-created");
      socket.off("room-updated");
      socket.off("room-error");
    };
  }, []);

  return (
    <>
      {room ? (
        <Room room={room} />
      ) : (
        <Lobby />
      )}
    </>
  );
}

export default App;