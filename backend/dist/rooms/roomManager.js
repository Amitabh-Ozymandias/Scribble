"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PLAYERS = void 0;
exports.createRoom = createRoom;
exports.getRoom = getRoom;
exports.getRooms = getRooms;
exports.roomExists = roomExists;
exports.isRoomFull = isRoomFull;
exports.addPlayer = addPlayer;
exports.removePlayer = removePlayer;
exports.getRoomByPlayer = getRoomByPlayer;
exports.setDrawer = setDrawer;
exports.nextDrawer = nextDrawer;
exports.setWordChoices = setWordChoices;
exports.setCurrentWord = setCurrentWord;
exports.startGame = startGame;
exports.resetTurnState = resetTurnState;
exports.recordDrawer = recordDrawer;
exports.haveAllPlayersDrawn = haveAllPlayersDrawn;
exports.resetRoundDrawers = resetRoundDrawers;
exports.endGame = endGame;
exports.setTimer = setTimer;
exports.resetGuesses = resetGuesses;
exports.markGuessed = markGuessed;
exports.everyoneGuessed = everyoneGuessed;
exports.addScore = addScore;
exports.getLeaderboard = getLeaderboard;
const rooms = new Map();
// ==========================
// CREATE ROOM
// ==========================
function createRoom(roomId, player) {
    const room = {
        id: roomId,
        hostId: player.id,
        players: [
            {
                ...player,
                score: 0,
                guessed: false,
            },
        ],
        drawerId: null,
        currentRound: 0,
        maxRounds: 3,
        currentWord: null,
        wordChoices: [],
        gameStarted: false,
        timer: 60,
        drawersInRound: [],
    };
    rooms.set(roomId, room);
    console.log("Room created:", room);
    return room;
}
// ==========================
// GET ROOM
// ==========================
function getRoom(roomId) {
    return rooms.get(roomId);
}
function getRooms() {
    return rooms;
}
function roomExists(roomId) {
    return rooms.has(roomId);
}
exports.MAX_PLAYERS = 7;
function isRoomFull(roomId) {
    const room = rooms.get(roomId);
    return room ? room.players.length >= exports.MAX_PLAYERS : false;
}
// ==========================
// PLAYER MANAGEMENT
// ==========================
function addPlayer(roomId, player) {
    const room = rooms.get(roomId);
    if (!room)
        return null;
    if (room.players.length >= exports.MAX_PLAYERS)
        return null;
    const alreadyJoined = room.players.some((p) => p.id === player.id);
    if (alreadyJoined)
        return null;
    room.players.push({
        ...player,
        score: 0,
        guessed: false,
    });
    console.log(`${player.name} joined ${roomId}`);
    return room;
}
function removePlayer(socketId) {
    for (const [roomId, room] of rooms) {
        const index = room.players.findIndex((player) => player.id === socketId);
        if (index === -1)
            continue;
        room.players.splice(index, 1);
        // Delete room if empty
        if (room.players.length === 0) {
            rooms.delete(roomId);
            console.log(`Deleted room ${roomId}`);
            return null;
        }
        // Transfer host
        if (room.hostId === socketId) {
            room.hostId = room.players[0].id;
        }
        // Transfer drawer if needed
        if (room.drawerId === socketId) {
            room.drawerId = room.players[0].id;
        }
        return room;
    }
    return null;
}
function getRoomByPlayer(socketId) {
    for (const room of rooms.values()) {
        if (room.players.some((player) => player.id === socketId)) {
            return room;
        }
    }
    return null;
}
// ==========================
// DRAWER
// ==========================
function setDrawer(roomId, drawerId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.drawerId = drawerId;
}
function nextDrawer(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    if (room.players.length === 0)
        return;
    const currentIndex = room.players.findIndex((player) => player.id === room.drawerId);
    const nextIndex = (currentIndex + 1) % room.players.length;
    room.drawerId = room.players[nextIndex].id;
}
// ==========================
// WORDS
// ==========================
function setWordChoices(roomId, words) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.wordChoices = words;
}
function setCurrentWord(roomId, word) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.currentWord = word;
}
function startGame(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.gameStarted = true;
    room.currentRound = 1;
    room.timer = 60;
    room.currentWord = null;
    room.wordChoices = [];
    room.drawersInRound = [];
    room.players.forEach((player) => {
        player.score = 0;
        player.guessed = false;
    });
}
function resetTurnState(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.currentWord = null;
    room.wordChoices = [];
    room.timer = 60;
    room.players.forEach((player) => {
        player.guessed = false;
    });
}
function recordDrawer(roomId, drawerId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    if (!room.drawersInRound.includes(drawerId)) {
        room.drawersInRound.push(drawerId);
    }
}
function haveAllPlayersDrawn(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return false;
    return room.players.every((p) => room.drawersInRound.includes(p.id));
}
function resetRoundDrawers(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.drawersInRound = [];
}
function endGame(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.gameStarted = false;
    room.currentWord = null;
    room.wordChoices = [];
    room.drawerId = null;
    room.drawersInRound = [];
}
// ==========================
// TIMER
// ==========================
function setTimer(roomId, seconds) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.timer = seconds;
}
// ==========================
// GUESSES
// ==========================
function resetGuesses(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.players.forEach((player) => {
        player.guessed = false;
    });
}
function markGuessed(roomId, playerId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player)
        return;
    player.guessed = true;
}
function everyoneGuessed(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return false;
    return room.players
        .filter((player) => player.id !== room.drawerId)
        .every((player) => player.guessed);
}
// ==========================
// SCORING
// ==========================
function addScore(roomId, playerId, score) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player)
        return;
    player.score += score;
}
function getLeaderboard(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return [];
    return [...room.players].sort((a, b) => b.score - a.score);
}
