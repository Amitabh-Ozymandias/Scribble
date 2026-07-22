import { useState } from "react";
import { socket } from "../socket";
import type { RoomType } from "../types";

type Props = {
  room: RoomType;
};

export default function Room({ room }: Props) {
  const [copied, setCopied] = useState(false);
  const isHost = socket.id === room.hostId;

  const leaveRoom = () => {
    socket.emit("leave-room");
  };

  const startGame = () => {
    socket.emit("start-game");
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="room-container">
      <div className="room-card">
        <h1 className="room-title">🎨 Scribble Lobby</h1>

        <div className="room-code-section">
          <span className="code-label">Room Code:</span>
          <div className="code-box">
            <span className="code-text">{room.id}</span>
            <button onClick={copyRoomCode} className="copy-btn">
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
        </div>

        <div className="room-players-section">
          <h3>Players Joined ({room.players.length})</h3>

          <div className="lobby-players-grid">
            {room.players.map((player) => (
              <div key={player.id} className="lobby-player-card">
                <div className="player-avatar">👤</div>
                <div className="player-details">
                  <span className="player-name">{player.name}</span>
                  {player.id === room.hostId && (
                    <span className="host-tag">👑 Host</span>
                  )}
                  {player.id === socket.id && (
                    <span className="you-tag">⭐ You</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="room-actions">
          <button onClick={leaveRoom} className="btn-secondary">
            Leave Room
          </button>

          {isHost ? (
            <button
              onClick={startGame}
              className="btn-primary start-game-btn"
              disabled={room.players.length < 1}
            >
              🚀 Start Game
            </button>
          ) : (
            <div className="waiting-host-msg">
              Waiting for the host to start the game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}