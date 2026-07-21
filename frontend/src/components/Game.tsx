import type { RoomType } from "../App";
import { socket } from "../socket";
import Canvas from "./Canvas";

type Props = {
  room: RoomType;
};

export default function Game({ room }: Props) {
  const me = room.players.find((player) => player.id === socket.id);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1>🎨 Scribble</h1>

      <h2>Game Started!</h2>

      <p>
        Welcome <strong>{me?.name}</strong>
      </p>

      <hr style={{ margin: "24px 0" }} />

      <h3>Players</h3>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
        }}
      >
        {room.players.map((player) => (
          <li
            key={player.id}
            style={{
              padding: "8px",
              fontSize: "18px",
            }}
          >
            {player.id === room.hostId ? "👑 " : "👤 "}
            {player.name}
          </li>
        ))}
      </ul>

      <hr style={{ margin: "24px 0" }} />

      <div
        style={{
          border: "2px dashed gray",
          height: "500px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
        }}
      >
        <Canvas />
      </div>
    </div>
  );
}