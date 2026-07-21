type Player = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  hostId: string;
  players: Player[];

  drawerId: string | null;
  currentRound: number;
  maxRounds: number;
  currentWord: string | null;
  gameStarted: boolean;
};

const rooms = new Map<string, Room>();

export function createRoom(roomId: string, player: Player): Room {
  const room: Room = {
    id: roomId,
    hostId: player.id,
    players: [player],

    drawerId: null,
    currentRound: 0,
    maxRounds: 3,
    currentWord: null,
    gameStarted: false,
  };

  rooms.set(roomId, room);

  console.log("Room created:", room);

  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId);
}

export function addPlayer(roomId: string, player: Player): Room | null {
  const room = rooms.get(roomId);

  if (!room) return null;

  const alreadyJoined = room.players.some(
    (p) => p.id === player.id
  );

  if (alreadyJoined) return null;

  room.players.push(player);

  return room;
}

export function removePlayer(socketId: string): Room | null {
  for (const [roomId, room] of rooms) {
    const index = room.players.findIndex(
      (player) => player.id === socketId
    );

    if (index === -1) continue;

    room.players.splice(index, 1);

    if (room.players.length === 0) {
      rooms.delete(roomId);
      return null;
    }

    if (room.hostId === socketId) {
      room.hostId = room.players[0].id;
    }

    // If the drawer left, assign the first remaining player.
    if (room.drawerId === socketId) {
      room.drawerId = room.players[0].id;
    }

    return room;
  }

  return null;
}

export function getRoomByPlayer(socketId: string): Room | null {
  for (const room of rooms.values()) {
    if (room.players.some((player) => player.id === socketId)) {
      return room;
    }
  }

  return null;
}

export function getRooms() {
  return rooms;
}

export function setDrawer(roomId: string, drawerId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.drawerId = drawerId;
}

export function nextDrawer(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  const currentIndex = room.players.findIndex(
    (player) => player.id === room.drawerId
  );

  const nextIndex =
    (currentIndex + 1) % room.players.length;

  room.drawerId = room.players[nextIndex].id;
}