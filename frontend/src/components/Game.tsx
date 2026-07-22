import { useEffect, useState } from "react";
import type { RoomType, LeaderboardEntry } from "../types";
import { socket } from "../socket";

import Canvas from "./Canvas";
import Chat from "./Chat";
import Players from "./Players";
import Timer from "./Timer";
import WordDisplay from "./WordDisplay";
import WordSelection from "./WordSelection";

type Props = {
  room: RoomType;
  leaderboard: LeaderboardEntry[] | null;
  onReturnToLobby: () => void;
};

export default function Game({ room, leaderboard, onReturnToLobby }: Props) {
  const isDrawer = socket.id === room.drawerId;

  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [myWord, setMyWord] = useState("");
  const [wordLength, setWordLength] = useState(0);
  const [time, setTime] = useState(room.timer || 60);
  const [revealedWord, setRevealedWord] = useState("");
  const [isIntermission, setIsIntermission] = useState(false);

  useEffect(() => {
    socket.on("choose-word", (words: string[]) => {
      console.log("Received word choices:", words);
      setWordChoices(words);
    });

    socket.on("round-started", ({ length }: { length: number }) => {
      setWordLength(length);
      setIsIntermission(false);
      setRevealedWord("");
    });

    socket.on("your-word", (word: string) => {
      setMyWord(word);
      setWordChoices([]);
    });

    socket.on("timer", (timeLeft: number) => {
      setTime(timeLeft);
    });

    socket.on("round-ended", ({ word }: { word: string }) => {
      setRevealedWord(word);
      setIsIntermission(true);
      setMyWord("");
      setWordLength(0);
      setWordChoices([]);
    });

    return () => {
      socket.off("choose-word");
      socket.off("round-started");
      socket.off("your-word");
      socket.off("timer");
      socket.off("round-ended");
    };
  }, []);

  function selectWord(word: string) {
    socket.emit("word-selected", word);
    setWordChoices([]);
  }

  // Fallback: If drawer, and room has wordChoices, but local state hasn't populated
  const activeWordChoices =
    isDrawer && !room.currentWord && wordChoices.length === 0 && room.wordChoices?.length > 0
      ? room.wordChoices
      : wordChoices;

  return (
    <div className="game-container">
      {/* Header Bar */}
      <header className="game-header">
        <div className="brand-logo">🎨 Scribble</div>

        <div className="game-round-info">
          <span className="round-badge">
            Round {room.currentRound || 1} / {room.maxRounds || 3}
          </span>
        </div>

        <Timer time={time} />
      </header>

      {/* Intermission Banner */}
      {isIntermission && (
        <div className="intermission-banner">
          <h3>Turn Ended!</h3>
          <p>The word was: <strong>{revealedWord.toUpperCase()}</strong></p>
        </div>
      )}

      {/* Word Header */}
      <div className="word-section">
        <WordDisplay
          myWord={myWord}
          wordLength={wordLength}
          revealedWord={revealedWord}
          isDrawer={isDrawer}
        />
      </div>

      {/* Word Selection Popup for Drawer */}
      {isDrawer && !room.currentWord && activeWordChoices.length > 0 && (
        <WordSelection words={activeWordChoices} onSelect={selectWord} />
      )}

      {/* Main Game Layout */}
      <div className="game-layout">
        {/* Left Sidebar: Players */}
        <aside className="players-sidebar">
          <Players room={room} />
        </aside>

        {/* Center Canvas */}
        <main className="canvas-main">
          <Canvas room={room} />
        </main>

        {/* Right Sidebar: Chat */}
        <aside className="chat-sidebar">
          <Chat isDrawer={isDrawer} isGameActive={room.gameStarted && !!room.currentWord} />
        </aside>
      </div>

      {/* Game Over Modal */}
      {leaderboard && (
        <div className="modal-overlay">
          <div className="game-over-modal">
            <h2>🏆 Game Over!</h2>
            <div className="podium-list">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`podium-item place-${index + 1}`}
                >
                  <span className="rank">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}</span>
                  <span className="name">{entry.name}</span>
                  <span className="score">{entry.score} pts</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={onReturnToLobby}>
              Back to Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}