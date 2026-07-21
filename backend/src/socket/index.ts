import { Server } from "socket.io";
import { Server as HttpServer } from "http";

import {
  createRoom,
  addPlayer,
  roomExists,
} from "../rooms/roomManager";

import { generateRoomId } from "../utils/generateRoomId";

export function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);

    socket.on("create-room", (playerName: string) => {
      const roomId = generateRoomId();

      const room = createRoom(roomId, {
        id: socket.id,
        name: playerName,
      });

      socket.join(roomId);

      socket.emit("room-created", room);
    });

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
          socket.emit("room-error", "Room does not exist");
          return;
        }

        const room = addPlayer(roomId, {
          id: socket.id,
          name: playerName,
        });

        if (!room) {
          socket.emit("room-error", "Already in room");
          return;
        }

        socket.join(roomId);

        io.to(roomId).emit("room-updated", room);
      }
    );

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });
  });
}