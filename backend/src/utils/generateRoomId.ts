const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomId(length = 5): string {
  let roomId = "";

  for (let i = 0; i < length; i++) {
    roomId += CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  return roomId;
}