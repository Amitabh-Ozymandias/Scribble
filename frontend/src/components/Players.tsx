import type { RoomType } from "../types";
import { socket } from "../socket";

type Props = {
  room: RoomType;
};

export default function Players({ room }: Props) {
  // Sort players by score descending for leaderboard display
  const sortedPlayers = [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="players-card">
      <h3 className="players-title">👥 Players ({room.players.length})</h3>

      <div className="players-list">
        {sortedPlayers.map((player, index) => {
          const isHost = player.id === room.hostId;
          const isDrawer = player.id === room.drawerId;
          const isMe = player.id === socket.id;
          const hasGuessed = player.guessed;

          return (
            <div
              key={player.id}
              className={`player-item ${isDrawer ? "is-drawing" : ""} ${
                hasGuessed ? "has-guessed" : ""
              } ${isMe ? "is-me" : ""}`}
            >
              <div className="player-rank">#{index + 1}</div>

              <div className="player-info">
                <div className="player-name-row">
                  <span className="player-name">
                    {player.name} {isMe && "(You)"}
                  </span>
                </div>
                <div className="player-score">{player.score || 0} pts</div>
              </div>

              <div className="player-badges">
                {isHost && <span className="badge host-badge" title="Host">👑</span>}
                {isDrawer && <span className="badge drawer-badge" title="Drawing">🎨</span>}
                {hasGuessed && <span className="badge guessed-badge" title="Guessed Correctly!">✅</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}