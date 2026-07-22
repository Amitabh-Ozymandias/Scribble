import { useState } from "react";
import { socket } from "../socket";
import type { RoomType } from "../types";

type Props = {
  room: RoomType;
};

export default function Room({ room }: Props) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const isHost = socket.id === room.hostId;

  const leaveRoom = () => {
    socket.emit("leave-room");
  };

  const startGame = () => {
    socket.emit("start-game");
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="room-container">
      <div className="room-card">
        <h1 className="room-title">🎨 Scribble Lobby</h1>

        <div className="room-code-section">
          <span className="code-label">Room Code:</span>
          <div className="code-box">
            <span className="code-text">{room.id}</span>
            <div className="copy-btn-group">
              <button onClick={copyRoomCode} className="copy-btn">
                {copiedCode ? "✓ Code Copied!" : "📋 Copy Code"}
              </button>
              <button onClick={copyInviteLink} className="copy-btn link-btn">
                {copiedLink ? "✓ Link Copied!" : "🔗 Copy Link"}
              </button>
            </div>
          </div>
        </div>

        <div className="room-players-section">
          <div className="players-header-flex">
            <h3>Players Joined</h3>
            <span className="capacity-badge">
              {room.players.length} / 7 Players
            </span>
          </div>

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
            🚪 Leave Room
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