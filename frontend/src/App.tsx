import { useEffect, useState } from "react";
import Lobby from "./components/Lobby";
import Room from "./components/Room";
import Game from "./components/Game";
import { socket } from "./socket";
import type { RoomType, LeaderboardEntry } from "./types";

export type { Player, RoomType } from "./types";

function App() {
  const [room, setRoom] = useState<RoomType | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("room-created", (updatedRoom: RoomType) => {
      setRoom(updatedRoom);
      setLeaderboard(null);
    });

    socket.on("room-updated", (updatedRoom: RoomType) => {
      setRoom(updatedRoom);
      if (updatedRoom.gameStarted) {
        setGameStarted(true);
      } else {
        setGameStarted(false);
      }
    });

    socket.on("left-room", () => {
      setRoom(null);
      setGameStarted(false);
      setLeaderboard(null);
    });

    socket.on("game-started", (updatedRoom: RoomType) => {
      console.log("Game Started!", updatedRoom);
      setRoom(updatedRoom);
      setGameStarted(true);
      setLeaderboard(null);
    });

    socket.on("game-ended", ({ leaderboard }: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(leaderboard);
      setGameStarted(false);
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
      socket.off("game-ended");
      socket.off("room-error");
    };
  }, []);

  if (!room) {
    return <Lobby />;
  }

  if (gameStarted || leaderboard) {
    return (
      <Game
        room={room}
        leaderboard={leaderboard}
        onReturnToLobby={() => setLeaderboard(null)}
      />
    );
  }

  return <Room room={room} />;
}

export default App;