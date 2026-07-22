import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Lobby() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check URL parameters for room code invite link (e.g. ?room=ABCD or ?join=ABCD)
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room") || params.get("join");
    if (roomParam) {
      setRoomId(roomParam.toUpperCase());
    }

    function handleRoomError(msg: string) {
      setErrorMsg(msg);
    }

    socket.on("room-error", handleRoomError);
    return () => {
      socket.off("room-error", handleRoomError);
    };
  }, []);

  const createRoom = () => {
    if (!name.trim()) return alert("Please enter your display name!");
    setErrorMsg("");
    socket.emit("create-room", name.trim());
  };

  const joinRoom = () => {
    if (!name.trim()) return alert("Please enter your display name!");
    if (!roomId.trim()) return alert("Please enter a room code!");
    setErrorMsg("");
    socket.emit("join-room", {
      roomId: roomId.trim().toUpperCase(),
      playerName: name.trim(),
    });
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-hero-title">🎨 Scribble</h1>
        <p className="lobby-subtitle">Draw, guess, and compete with friends (Max 7 players per room)!</p>

        {errorMsg && (
          <div className="error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name-input">Your Display Name</label>
          <input
            id="name-input"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="lobby-input"
            maxLength={16}
          />
        </div>

        <div className="lobby-divider">
          <span>Option 1: Host a Game</span>
        </div>

        <button onClick={createRoom} className="btn-primary full-width">
          ✨ Create New Room
        </button>

        <div className="lobby-divider">
          <span>Option 2: Join Existing Room</span>
        </div>

        <div className="join-group">
          <input
            placeholder="Enter Room Code (e.g. ABCD)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            className="lobby-input code-input"
            maxLength={8}
          />
          <button onClick={joinRoom} className="btn-secondary">
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}