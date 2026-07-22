export type Player = {
  id: string;
  name: string;
  score: number;
  guessed: boolean;
};

export type Room = {
  id: string;
  hostId: string;
  players: Player[];

  // Game State
  drawerId: string | null;
  currentRound: number;
  maxRounds: number;
  currentWord: string | null;
  wordChoices: string[];
  gameStarted: boolean;
  timer: number;
  drawersInRound: string[];
};

const rooms = new Map<string, Room>();

// ==========================
// CREATE ROOM
// ==========================

export function createRoom(roomId: string, player: {
  id: string;
  name: string;
}): Room {
  const room: Room = {
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

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function getRooms() {
  return rooms;
}

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId);
}

export const MAX_PLAYERS = 7;

export function isRoomFull(roomId: string): boolean {
  const room = rooms.get(roomId);
  return room ? room.players.length >= MAX_PLAYERS : false;
}

// ==========================
// PLAYER MANAGEMENT
// ==========================

export function addPlayer(
  roomId: string,
  player: {
    id: string;
    name: string;
  }
): Room | null {
  const room = rooms.get(roomId);

  if (!room) return null;

  if (room.players.length >= MAX_PLAYERS) return null;

  const alreadyJoined = room.players.some(
    (p) => p.id === player.id
  );

  if (alreadyJoined) return null;

  room.players.push({
    ...player,
    score: 0,
    guessed: false,
  });

  console.log(`${player.name} joined ${roomId}`);

  return room;
}

export function removePlayer(socketId: string): Room | null {
  for (const [roomId, room] of rooms) {
    const index = room.players.findIndex(
      (player) => player.id === socketId
    );

    if (index === -1) continue;

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

export function getRoomByPlayer(
  socketId: string
): Room | null {
  for (const room of rooms.values()) {
    if (
      room.players.some(
        (player) => player.id === socketId
      )
    ) {
      return room;
    }
  }

  return null;
}

// ==========================
// DRAWER
// ==========================

export function setDrawer(
  roomId: string,
  drawerId: string
) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.drawerId = drawerId;
}

export function nextDrawer(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  if (room.players.length === 0) return;

  const currentIndex = room.players.findIndex(
    (player) => player.id === room.drawerId
  );

  const nextIndex =
    (currentIndex + 1) % room.players.length;

  room.drawerId = room.players[nextIndex].id;
}

// ==========================
// WORDS
// ==========================

export function setWordChoices(
  roomId: string,
  words: string[]
) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.wordChoices = words;
}

export function setCurrentWord(
  roomId: string,
  word: string
) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.currentWord = word;
}

export function startGame(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

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

export function resetTurnState(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.currentWord = null;
  room.wordChoices = [];
  room.timer = 60;

  room.players.forEach((player) => {
    player.guessed = false;
  });
}

export function recordDrawer(roomId: string, drawerId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  if (!room.drawersInRound.includes(drawerId)) {
    room.drawersInRound.push(drawerId);
  }
}

export function haveAllPlayersDrawn(roomId: string): boolean {
  const room = rooms.get(roomId);

  if (!room) return false;

  return room.players.every((p) => room.drawersInRound.includes(p.id));
}

export function resetRoundDrawers(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.drawersInRound = [];
}

export function endGame(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.gameStarted = false;
  room.currentWord = null;
  room.wordChoices = [];
  room.drawerId = null;
  room.drawersInRound = [];
}

// ==========================
// TIMER
// ==========================

export function setTimer(
  roomId: string,
  seconds: number
) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.timer = seconds;
}

// ==========================
// GUESSES
// ==========================

export function resetGuesses(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.players.forEach((player) => {
    player.guessed = false;
  });
}

export function markGuessed(
  roomId: string,
  playerId: string
) {
  const room = rooms.get(roomId);

  if (!room) return;

  const player = room.players.find(
    (p) => p.id === playerId
  );

  if (!player) return;

  player.guessed = true;
}

export function everyoneGuessed(
  roomId: string
): boolean {
  const room = rooms.get(roomId);

  if (!room) return false;

  return room.players
    .filter((player) => player.id !== room.drawerId)
    .every((player) => player.guessed);
}

// ==========================
// SCORING
// ==========================

export function addScore(
  roomId: string,
  playerId: string,
  score: number
) {
  const room = rooms.get(roomId);

  if (!room) return;

  const player = room.players.find(
    (p) => p.id === playerId
  );

  if (!player) return;

  player.score += score;
}

export function getLeaderboard(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return [];

  return [...room.players].sort(
    (a, b) => b.score - a.score
  );
}