import { useEffect, useState } from "react";
import { socket } from "../socket";
import type { AuthUser } from "../types";
import AuthModal from "./AuthModal";

export default function Lobby() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Check URL parameters for room code invite link (e.g. ?room=ABCD or ?join=ABCD)
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room") || params.get("join");
    if (roomParam) {
      setRoomId(roomParam.toUpperCase());
    }

    // Load saved user session from localStorage
    const savedUserStr = localStorage.getItem("scribble_user");
    if (savedUserStr) {
      try {
        const savedUser: AuthUser = JSON.parse(savedUserStr);
        setUser(savedUser);
        setName(savedUser.name);
      } catch (err) {
        console.error("Error parsing saved user:", err);
      }
    }

    function handleRoomError(msg: string) {
      setErrorMsg(msg);
    }

    socket.on("room-error", handleRoomError);
    return () => {
      socket.off("room-error", handleRoomError);
    };
  }, []);

  function handleAuthSuccess(signedInUser: AuthUser) {
    setUser(signedInUser);
    setName(signedInUser.name);
    localStorage.setItem("scribble_user", JSON.stringify(signedInUser));
  }

  function handleSignOut() {
    setUser(null);
    localStorage.removeItem("scribble_user");
  }

  const createRoom = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const finalName = name.trim() || user.name;
    if (!finalName) return alert("Please enter your display name!");
    setErrorMsg("");
    socket.emit("create-room", finalName);
  };

  const joinRoom = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const finalName = name.trim() || user.name;
    if (!finalName) return alert("Please enter your display name!");
    if (!roomId.trim()) return alert("Please enter a room code!");
    setErrorMsg("");
    socket.emit("join-room", {
      roomId: roomId.trim().toUpperCase(),
      playerName: finalName,
    });
  };

  return (
    <div className="lobby-container">
      {/* Top User Sign-In Bar */}
      <div className="user-account-bar">
        {user ? (
          <div className="user-pill-container">
            <div className="user-avatar-badge">👤</div>
            <div className="user-info-text">
              <span className="user-name-label">{user.name}</span>
              <span className="user-email-label">{user.email}</span>
            </div>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="sign-in-nav-btn"
          >
            🔐 Sign In with Email OTP
          </button>
        )}
      </div>

      <div className="lobby-card">
        <h1 className="lobby-hero-title">🎨 Scribble</h1>
        <p className="lobby-subtitle">
          Draw, guess, and compete with friends (Max 7 players per room)!
        </p>

        {errorMsg && <div className="error-banner">⚠️ {errorMsg}</div>}

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

      {/* Email OTP Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}