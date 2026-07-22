"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const wordManager_1 = require("../game/wordManager");
const roomManager_1 = require("../rooms/roomManager");
const generateRoomId_1 = require("../utils/generateRoomId");
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
        },
    });
    const timers = new Map();
    function stopTimer(roomId) {
        if (timers.has(roomId)) {
            clearInterval(timers.get(roomId));
            timers.delete(roomId);
        }
    }
    function startRoundTimer(roomId) {
        const room = (0, roomManager_1.getRoom)(roomId);
        if (!room)
            return;
        stopTimer(roomId);
        let timeLeft = 60;
        (0, roomManager_1.setTimer)(roomId, timeLeft);
        io.to(roomId).emit("timer", timeLeft);
        const interval = setInterval(() => {
            timeLeft--;
            (0, roomManager_1.setTimer)(roomId, timeLeft);
            io.to(roomId).emit("timer", timeLeft);
            if (timeLeft <= 0) {
                stopTimer(roomId);
                handleTurnEnd(roomId);
            }
        }, 1000);
        timers.set(roomId, interval);
    }
    function handleTurnEnd(roomId) {
        const room = (0, roomManager_1.getRoom)(roomId);
        if (!room)
            return;
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
            const activeRoom = (0, roomManager_1.getRoom)(roomId);
            if (!activeRoom || !activeRoom.gameStarted)
                return;
            // Check if all players in room have drawn this round
            if ((0, roomManager_1.haveAllPlayersDrawn)(roomId)) {
                (0, roomManager_1.resetRoundDrawers)(roomId);
                activeRoom.currentRound++;
                if (activeRoom.currentRound > activeRoom.maxRounds) {
                    // Game Completed
                    (0, roomManager_1.endGame)(roomId);
                    const leaderboard = (0, roomManager_1.getLeaderboard)(roomId);
                    io.to(roomId).emit("game-ended", { leaderboard });
                    io.to(roomId).emit("room-updated", activeRoom);
                    return;
                }
            }
            // Advance drawer
            (0, roomManager_1.nextDrawer)(roomId);
            if (activeRoom.drawerId) {
                (0, roomManager_1.recordDrawer)(roomId, activeRoom.drawerId);
            }
            (0, roomManager_1.resetTurnState)(roomId);
            const choices = (0, wordManager_1.getRandomWords)();
            (0, roomManager_1.setWordChoices)(roomId, choices);
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
        socket.on("create-room", (playerName) => {
            const roomId = (0, generateRoomId_1.generateRoomId)();
            const room = (0, roomManager_1.createRoom)(roomId, {
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
        socket.on("join-room", ({ roomId, playerName, }) => {
            if (!(0, roomManager_1.roomExists)(roomId)) {
                socket.emit("room-error", "Room does not exist");
                return;
            }
            if ((0, roomManager_1.isRoomFull)(roomId)) {
                socket.emit("room-error", "Room is full (max 7 players allowed).");
                return;
            }
            const room = (0, roomManager_1.addPlayer)(roomId, {
                id: socket.id,
                name: playerName,
            });
            if (!room) {
                socket.emit("room-error", "Already in room");
                return;
            }
            socket.join(roomId);
            io.to(roomId).emit("room-updated", room);
        });
        // ==========================
        // LEAVE ROOM
        // ==========================
        socket.on("leave-room", () => {
            const room = (0, roomManager_1.getRoomByPlayer)(socket.id);
            if (!room)
                return;
            const roomId = room.id;
            socket.leave(roomId);
            const updatedRoom = (0, roomManager_1.removePlayer)(socket.id);
            socket.emit("left-room");
            if (updatedRoom) {
                io.to(roomId).emit("room-updated", updatedRoom);
            }
            else {
                stopTimer(roomId);
            }
        });
        // ==========================
        // START GAME
        // ==========================
        socket.on("start-game", () => {
            const room = (0, roomManager_1.getRoomByPlayer)(socket.id);
            if (!room) {
                socket.emit("room-error", "You are not in a room.");
                return;
            }
            if (room.hostId !== socket.id) {
                socket.emit("room-error", "Only the host can start the game.");
                return;
            }
            (0, roomManager_1.startGame)(room.id);
            if (room.players.length > 0) {
                room.drawerId = room.players[0].id;
                (0, roomManager_1.recordDrawer)(room.id, room.drawerId);
            }
            const choices = (0, wordManager_1.getRandomWords)();
            (0, roomManager_1.setWordChoices)(room.id, choices);
            io.to(room.id).emit("game-started", room);
            io.to(room.id).emit("room-updated", room);
            if (room.drawerId) {
                io.to(room.drawerId).emit("choose-word", choices);
            }
        });
        // ==========================
        // WORD SELECTION
        // ==========================
        socket.on("word-selected", (word) => {
            const room = (0, roomManager_1.getRoomByPlayer)(socket.id);
            if (!room)
                return;
            if (room.drawerId !== socket.id)
                return;
            if (room.currentWord !== null)
                return;
            if (room.wordChoices.length === 0 || !room.wordChoices.includes(word)) {
                socket.emit("room-error", "Invalid word selection.");
                return;
            }
            (0, roomManager_1.setCurrentWord)(room.id, word);
            room.wordChoices = [];
            (0, roomManager_1.resetGuesses)(room.id);
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
        socket.on("draw", (stroke) => {
            const room = (0, roomManager_1.getRoomByPlayer)(socket.id);
            if (!room)
                return;
            if (room.drawerId !== socket.id)
                return;
            socket.to(room.id).emit("draw", stroke);
        });
        socket.on("clear-canvas", () => {
            const room = (0, roomManager_1.getRoomByPlayer)(socket.id);
            if (!room)
                return;
            if (room.drawerId !== socket.id)
                return;
            io.to(room.id).emit("clear-canvas");
        });
        // ==========================
        // CHAT & GUESSING
        // ==========================
        socket.on("chat-message", (messageText) => {
            const room = (0, roomManager_1.getRoomByPlayer)(socket.id);
            if (!room)
                return;
            const player = room.players.find((p) => p.id === socket.id);
            if (!player)
                return;
            const text = messageText.trim();
            if (!text)
                return;
            // Drawer cannot type in chat during an active turn
            if (room.drawerId === socket.id && room.currentWord) {
                return;
            }
            // Check guess if game is active, turn is active, and player hasn't guessed yet
            if (room.gameStarted &&
                room.currentWord &&
                !player.guessed &&
                room.drawerId !== socket.id) {
                const isCorrect = text.toLowerCase() === room.currentWord.trim().toLowerCase();
                if (isCorrect) {
                    (0, roomManager_1.markGuessed)(room.id, socket.id);
                    // Calculate score based on remaining time
                    const points = Math.max(50, 100 + room.timer * 10);
                    (0, roomManager_1.addScore)(room.id, socket.id, points);
                    // Award bonus points to drawer
                    if (room.drawerId) {
                        (0, roomManager_1.addScore)(room.id, room.drawerId, 50);
                    }
                    io.to(room.id).emit("chat-message", {
                        sender: "System",
                        message: `🎉 ${player.name} guessed the word!`,
                        isSystem: true,
                        isCorrectGuess: true,
                    });
                    io.to(room.id).emit("room-updated", room);
                    if ((0, roomManager_1.everyoneGuessed)(room.id)) {
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
            const room = (0, roomManager_1.getRoomByPlayer)(socket.id);
            if (room) {
                const roomId = room.id;
                const updatedRoom = (0, roomManager_1.removePlayer)(socket.id);
                if (updatedRoom) {
                    io.to(roomId).emit("room-updated", updatedRoom);
                }
                else {
                    stopTimer(roomId);
                }
                console.log(`${socket.id} removed from room ${roomId}`);
            }
            console.log(`${socket.id} disconnected`);
        });
    });
}
