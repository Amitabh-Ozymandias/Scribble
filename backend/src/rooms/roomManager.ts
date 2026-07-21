type Player = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  hostId: string;
  players: Player[];
  drawerId: string | null;
};

const rooms = new Map<string, Room>();

export function createRoom(roomId: string, player: Player): Room {
  const room: Room = {
    id: roomId,
    hostId: player.id,
    players: [player],
    drawerId: null,
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

  console.log("Player joined:", player.name);
  console.log("Current room:", room);

  return room;
}

export function removePlayer(socketId: string): Room | null {
  for (const [roomId, room] of rooms) {
    const index = room.players.findIndex(
      (player) => player.id === socketId
    );

    if (index === -1) continue;

    console.log("Removing player:", room.players[index]);

    room.players.splice(index, 1);

    // Room empty -> delete it
    if (room.players.length === 0) {
      console.log(`Deleting empty room ${roomId}`);
      rooms.delete(roomId);
      return null;
    }

    // Host left -> assign first remaining player
    if (room.hostId === socketId) {
      room.hostId = room.players[0].id;
      console.log("Host transferred to:", room.hostId);
    }

    console.log("Updated room:", room);

    return room;
  }

  console.log("Player not found in any room:", socketId);

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

export function setDrawer(
    roomId: string,
    drawerId: string
) {
    const room = rooms.get(roomId);

    if (!room) return;

    room.drawerId = drawerId;
}