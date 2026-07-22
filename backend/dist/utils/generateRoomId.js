"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomId = generateRoomId;
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateRoomId(length = 5) {
    let roomId = "";
    for (let i = 0; i < length; i++) {
        roomId += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return roomId;
}
