import { Server } from "socket.io";
import http from "http";
import {
  createRoom,
  addPlayer,
  roomExists,
} from "../rooms/roomManager";

import { generateRoomId } from "../utils/generateRoomId";

export function initializeSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
  console.log(`🟢 ${socket.id} connected`);

  // -------------------------
  // CREATE ROOM
  // -------------------------

  socket.on("create-room", (playerName: string) => {
    const roomId = generateRoomId();

    const room = createRoom(roomId, {
      id: socket.id,
      name: playerName,
    });

    socket.join(roomId);

    socket.emit("room-created", room);

    console.log(room);
  });

  // -------------------------
  // JOIN ROOM
  // -------------------------

  socket.on(
    "join-room",
    ({
      roomId,
      playerName,
    }: {
      roomId: string;
      playerName: string;
    }) => {
      if (!roomExists(roomId)) {
        socket.emit("error", "Room does not exist");
        return;
      }

      const room = addPlayer(roomId, {
        id: socket.id,
        name: playerName,
      });

      if (!room) return;

      socket.join(roomId);

      io.to(roomId).emit("room-updated", room);

      console.log(room);
    }
  );

  // -------------------------
  // DISCONNECT
  // -------------------------

  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);
  });
});

  return io;
}