import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import type { ChatMessage } from "../types";

type Props = {
  isDrawer?: boolean;
  isGameActive?: boolean;
};

export default function Chat({ isDrawer, isGameActive }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMessage(chat: ChatMessage) {
      setMessages((prev) => [...prev, chat]);
    }

    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    if (isDrawer && isGameActive) return;

    socket.emit("chat-message", text);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div className="chat-card">
      <h3 className="chat-title">💬 Chat & Guesses</h3>

      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Start guessing!</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-msg ${msg.isSystem ? "system-msg" : ""} ${
                msg.isCorrectGuess ? "correct-guess-msg" : ""
              }`}
            >
              {msg.isSystem ? (
                <div className="system-text">{msg.message}</div>
              ) : (
                <div>
                  <strong className="chat-sender">{msg.sender}:</strong>{" "}
                  <span className="chat-text">{msg.message}</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatBottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDrawer && isGameActive}
          placeholder={
            isDrawer && isGameActive
              ? "You are drawing! Chat disabled."
              : "Type your guess here..."
          }
          className="chat-input"
        />

        <button
          onClick={sendMessage}
          disabled={isDrawer && isGameActive}
          className="chat-send-btn"
        >
          Send
        </button>
      </div>
    </div>
  );
}