import type { LeaderboardEntry } from "../types";

type Props = {
  leaderboard: LeaderboardEntry[];
  onReturnToLobby: () => void;
};

export default function Scoreboard({ leaderboard, onReturnToLobby }: Props) {
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);

  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const rest = sorted.slice(3);

  return (
    <div className="scoreboard-modal-overlay">
      <div className="scoreboard-card">
        <div className="scoreboard-header">
          <span className="trophy-badge">🏆</span>
          <h2>Game Completed!</h2>
          <p className="scoreboard-subtitle">Final Standings & Leaderboard</p>
        </div>

        {/* Podium Layout */}
        <div className="podium-container">
          {/* 2nd Place Podium */}
          {second && (
            <div className="podium-column place-2">
              <div className="podium-avatar silver-glow">
                <span>🥈</span>
              </div>
              <div className="podium-player-name">{second.name}</div>
              <div className="podium-score">{second.score} pts</div>
              <div className="podium-block silver-block">
                <span className="podium-rank">2</span>
              </div>
            </div>
          )}

          {/* 1st Place Podium */}
          {first && (
            <div className="podium-column place-1">
              <div className="crown-badge">👑</div>
              <div className="podium-avatar gold-glow">
                <span>🥇</span>
              </div>
              <div className="podium-player-name winner-name">{first.name}</div>
              <div className="podium-score winner-score">{first.score} pts</div>
              <div className="podium-block gold-block">
                <span className="podium-rank">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place Podium */}
          {third && (
            <div className="podium-column place-3">
              <div className="podium-avatar bronze-glow">
                <span>🥉</span>
              </div>
              <div className="podium-player-name">{third.name}</div>
              <div className="podium-score">{third.score} pts</div>
              <div className="podium-block bronze-block">
                <span className="podium-rank">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Rest of Players (4th+) */}
        {rest.length > 0 && (
          <div className="scoreboard-rest-list">
            <h4>Other Competitors</h4>
            {rest.map((player, index) => (
              <div key={player.id} className="scoreboard-rest-item">
                <span className="rest-rank">#{index + 4}</span>
                <span className="rest-name">{player.name}</span>
                <span className="rest-score">{player.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <div className="scoreboard-actions">
          <button className="btn-primary scoreboard-btn" onClick={onReturnToLobby}>
            🔄 Return to Room Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
