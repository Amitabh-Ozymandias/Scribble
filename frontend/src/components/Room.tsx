import { socket } from "../socket";
import type { RoomType } from "../App";

type Props = {
  room: RoomType;
};

export default function Room({ room }: Props) {
  const isHost = socket.id === room.hostId;

  const leaveRoom = () => {
    socket.emit("leave-room");
    window.location.reload();
  };

  const startGame = () => {
    socket.emit("start-game");
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "24px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <h1>Scribble</h1>

      <h2>Room Code</h2>
      <h3>{room.id}</h3>

      <hr />

      <h2>Players ({room.players.length})</h2>

      {room.players.map((player) => (
        <div
          key={player.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid #ddd",
          }}
        >
          <span>{player.name}</span>

          <span>
            {player.id === room.hostId ? "👑 Host" : "👤 Player"}
          </span>
        </div>
      ))}

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button onClick={leaveRoom}>
          Leave Room
        </button>

        {isHost && (
          <button onClick={startGame}>
            Start Game
          </button>
        )}
      </div>
    </div>
  );
}