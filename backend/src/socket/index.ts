import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Stroke } from "../types/stroke";

import {
  createRoom,
  addPlayer,
  roomExists,
  removePlayer,
  getRoomByPlayer,
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

    // ==========================
    // CREATE ROOM
    // ==========================
    socket.on("create-room", (playerName: string) => {
      const roomId = generateRoomId();

      const room = createRoom(roomId, {
        id: socket.id,
        name: playerName,
      });

      socket.join(roomId);

      socket.emit("room-created", room);
    });

    // ==========================
    // JOIN ROOM
    // ==========================
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

    // ==========================
    // LEAVE ROOM
    // ==========================
    socket.on("leave-room", () => {
      const room = getRoomByPlayer(socket.id);

      if (!room) return;

      const roomId = room.id;

      socket.leave(roomId);

      const updatedRoom = removePlayer(socket.id);

      socket.emit("left-room");

      if (updatedRoom) {
        io.to(roomId).emit("room-updated", updatedRoom);
      }
    });

    // ==========================
    // START GAME
    // ==========================
    socket.on("start-game", () => {
      const room = getRoomByPlayer(socket.id);

      if (!room) {
        socket.emit("room-error", "You are not in a room.");
        return;
      }

      if (room.hostId !== socket.id) {
        socket.emit("room-error", "Only the host can start the game.");
        return;
      }

      console.log(`Game started in room ${room.id}`);
      room.drawerId = room.players[0].id;

      io.to(room.id).emit("game-started", room);
    });

    socket.on("draw", (stroke: Stroke) => {
        const room = getRoomByPlayer(socket.id);

        if (!room) return;

        socket.to(room.id).emit("draw", stroke);
    });
    socket.on("clear-canvas", () => {
        const room = getRoomByPlayer(socket.id);

        if (!room) return;

        io.to(room.id).emit("clear-canvas");
    });

    // ==========================
    // DISCONNECT
    // ==========================
    socket.on("disconnect", () => {
      const room = getRoomByPlayer(socket.id);

      if (room) {
        const roomId = room.id;

        const updatedRoom = removePlayer(socket.id);

        if (updatedRoom) {
          io.to(roomId).emit("room-updated", updatedRoom);
        }

        console.log(`${socket.id} removed from room ${roomId}`);
      }

      console.log(`${socket.id} disconnected`);
    });
  });
}