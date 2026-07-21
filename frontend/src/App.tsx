import { useEffect, useState } from "react";
import Lobby from "./components/Lobby.tsx";
import Room from "./components/Room.tsx";
import Game from "./components/Game.tsx";
import { socket } from "./socket";

export type Player = {
  id: string;
  name: string;
};

export type RoomType = {
  id: string;
  hostId: string;
  players: Player[];
  drawerId: string | null;
};

function App() {
  const [room, setRoom] = useState<RoomType | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("room-created", (room: RoomType) => {
      setRoom(room);
    });

    socket.on("room-updated", (room: RoomType) => {
      setRoom(room);
    });

    socket.on("left-room", () => {
      setRoom(null);
      setGameStarted(false);
    });

    socket.on("game-started", (room: RoomType) => {
      console.log("Game Started!", room);

      setRoom(room);
      setGameStarted(true);
    });

    socket.on("room-error", (message: string) => {
      alert(message);
    });

    return () => {
      socket.off("connect");
      socket.off("room-created");
      socket.off("room-updated");
      socket.off("left-room");
      socket.off("game-started");
      socket.off("room-error");
    };
  }, []);

  if (!room) {
    return <Lobby />;
  }

  if (gameStarted) {
    return <Game room={room} />;
  }

  return <Room room={room} />;
}

export default App;