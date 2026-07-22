import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Stroke } from "../types/stroke";
import { getRandomWords } from "../game/wordManager";

import {
  createRoom,
  addPlayer,
  roomExists,
  isRoomFull,
  removePlayer,
  getRoom,
  getRoomByPlayer,
  setWordChoices,
  setCurrentWord,
  setTimer,
  resetGuesses,
  markGuessed,
  everyoneGuessed,
  addScore,
  getLeaderboard,
  startGame,
  resetTurnState,
  recordDrawer,
  haveAllPlayersDrawn,
  resetRoundDrawers,
  nextDrawer,
  endGame,
} from "../rooms/roomManager";

import { generateRoomId } from "../utils/generateRoomId";

export function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const timers = new Map<string, NodeJS.Timeout>();

  function stopTimer(roomId: string) {
    if (timers.has(roomId)) {
      clearInterval(timers.get(roomId)!);
      timers.delete(roomId);
    }
  }

  function startRoundTimer(roomId: string) {
    const room = getRoom(roomId);
    if (!room) return;

    stopTimer(roomId);

    let timeLeft = 60;
    setTimer(roomId, timeLeft);
    io.to(roomId).emit("timer", timeLeft);

    const interval = setInterval(() => {
      timeLeft--;
      setTimer(roomId, timeLeft);
      io.to(roomId).emit("timer", timeLeft);

      if (timeLeft <= 0) {
        stopTimer(roomId);
        handleTurnEnd(roomId);
      }
    }, 1000);

    timers.set(roomId, interval);
  }

  function handleTurnEnd(roomId: string) {
    const room = getRoom(roomId);
    if (!room) return;

    stopTimer(roomId);

    const word = room.currentWord || "";

    io.to(roomId).emit("round-ended", { word });
    io.to(roomId).emit("chat-message", {
      sender: "System",
      message: `The word was: ${word}`,
      isSystem: true,
    });

    // 4 seconds intermission for players to view the word
    setTimeout(() => {
      const activeRoom = getRoom(roomId);
      if (!activeRoom || !activeRoom.gameStarted) return;

      // Check if all players in room have drawn this round
      if (haveAllPlayersDrawn(roomId)) {
        resetRoundDrawers(roomId);
        activeRoom.currentRound++;

        if (activeRoom.currentRound > activeRoom.maxRounds) {
          // Game Completed
          endGame(roomId);
          const leaderboard = getLeaderboard(roomId);
          io.to(roomId).emit("game-ended", { leaderboard });
          io.to(roomId).emit("room-updated", activeRoom);
          return;
        }
      }

      // Advance drawer
      nextDrawer(roomId);
      if (activeRoom.drawerId) {
        recordDrawer(roomId, activeRoom.drawerId);
      }

      resetTurnState(roomId);
      const choices = getRandomWords();
      setWordChoices(roomId, choices);

      io.to(roomId).emit("clear-canvas");
      io.to(roomId).emit("room-updated", activeRoom);

      if (activeRoom.drawerId) {
        io.to(activeRoom.drawerId).emit("choose-word", choices);
      }
    }, 4000);
  }

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
      io.to(roomId).emit("room-updated", room);
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

        if (isRoomFull(roomId)) {
          socket.emit("room-error", "Room is full (max 7 players allowed).");
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
      } else {
        stopTimer(roomId);
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
        socket.emit(
          "room-error",
          "Only the host can start the game."
        );
        return;
      }

      startGame(room.id);

      if (room.players.length > 0) {
        room.drawerId = room.players[0].id;
        recordDrawer(room.id, room.drawerId);
      }

      const choices = getRandomWords();
      setWordChoices(room.id, choices);

      io.to(room.id).emit("game-started", room);
      io.to(room.id).emit("room-updated", room);

      if (room.drawerId) {
        io.to(room.drawerId).emit("choose-word", choices);
      }
    });

    // ==========================
    // WORD SELECTION
    // ==========================
    socket.on("word-selected", (word: string) => {
      const room = getRoomByPlayer(socket.id);

      if (!room) return;
      if (room.drawerId !== socket.id) return;
      if (room.currentWord !== null) return;

      if (room.wordChoices.length === 0 || !room.wordChoices.includes(word)) {
        socket.emit("room-error", "Invalid word selection.");
        return;
      }

      setCurrentWord(room.id, word);
      room.wordChoices = [];
      resetGuesses(room.id);

      io.to(room.id).emit("room-updated", room);

      io.to(room.id).emit("round-started", {
        length: word.length,
        round: room.currentRound,
      });

      io.to(room.drawerId).emit("your-word", word);

      startRoundTimer(room.id);
    });

    // ==========================
    // DRAWING
    // ==========================
    socket.on("draw", (stroke: Stroke) => {
      const room = getRoomByPlayer(socket.id);
      if (!room) return;
      if (room.drawerId !== socket.id) return;

      socket.to(room.id).emit("draw", stroke);
    });

    socket.on("clear-canvas", () => {
      const room = getRoomByPlayer(socket.id);
      if (!room) return;
      if (room.drawerId !== socket.id) return;

      io.to(room.id).emit("clear-canvas");
    });

    // ==========================
    // CHAT & GUESSING
    // ==========================
    socket.on("chat-message", (messageText: string) => {
      const room = getRoomByPlayer(socket.id);
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      const text = messageText.trim();
      if (!text) return;

      // Drawer cannot type in chat during an active turn
      if (room.drawerId === socket.id && room.currentWord) {
        return;
      }

      // Check guess if game is active, turn is active, and player hasn't guessed yet
      if (
        room.gameStarted &&
        room.currentWord &&
        !player.guessed &&
        room.drawerId !== socket.id
      ) {
        const isCorrect =
          text.toLowerCase() === room.currentWord.trim().toLowerCase();

        if (isCorrect) {
          markGuessed(room.id, socket.id);

          // Calculate score based on remaining time
          const points = Math.max(50, 100 + room.timer * 10);
          addScore(room.id, socket.id, points);

          // Award bonus points to drawer
          if (room.drawerId) {
            addScore(room.id, room.drawerId, 50);
          }

          io.to(room.id).emit("chat-message", {
            sender: "System",
            message: `🎉 ${player.name} guessed the word!`,
            isSystem: true,
            isCorrectGuess: true,
          });

          io.to(room.id).emit("room-updated", room);

          if (everyoneGuessed(room.id)) {
            handleTurnEnd(room.id);
          }
          return;
        }
      }

      // Regular Chat Message
      io.to(room.id).emit("chat-message", {
        sender: player.name,
        message: text,
      });
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
        } else {
          stopTimer(roomId);
        }

        console.log(`${socket.id} removed from room ${roomId}`);
      }

      console.log(`${socket.id} disconnected`);
    });
  });
}