import { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected!");

      setSocketId(socket.id!);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "28px",
      }}
    >
      Socket ID:
      <br />
      {socketId}
    </div>
  );
}

export default App;