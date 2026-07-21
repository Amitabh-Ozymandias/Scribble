type Player = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  hostId: string;
  players: Player[];
};

const rooms = new Map<string, Room>();

export function createRoom(roomId: string, player: Player): Room {
  const room: Room = {
    id: roomId,
    hostId: player.id,
    players: [player],
  };

  rooms.set(roomId, room);

  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function addPlayer(
  roomId: string,
  player: Player
): Room | null {
  const room = rooms.get(roomId);

  if (!room) return null;

  const alreadyJoined = room.players.some(
    (p) => p.id === player.id
  );

  if (alreadyJoined) {
    return null;
  }

  room.players.push(player);

  return room;
}

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId);
}

export function getRooms() {
  return rooms;
}