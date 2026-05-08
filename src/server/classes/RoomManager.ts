import { type Player, type RoomData } from "../types/socket";

export class RoomManager {
  private rooms: Map<string, RoomData> = new Map();

  private generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(
    socketId: string,
    username: string,
  ): { code: string; playerNum: number } {
    let code = this.generateCode();
    while (this.rooms.has(code)) {
      code = this.generateCode();
    }

    const player: Player = {
      id: socketId,
      username,
      isLeader: true,
    };

    const room: RoomData = {
      code,
      players: [player],
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);

    return { code, playerNum: 1 };
  }

  joinRoom(
    code: string,
    socketId: string,
    username: string,
  ): { players: Player[]; playerNum: number } | null {
    const room = this.rooms.get(code.toUpperCase());

    if (!room) {
      return null;
    }

    if (room.players.length >= 2) {
      return null;
    }

    // Check if player is already in room
    if (room.players.some((p) => p.id === socketId)) {
      return { players: room.players, playerNum: room.players.length };
    }

    const newPlayer: Player = {
      id: socketId,
      username,
      isLeader: false,
    };

    room.players.push(newPlayer);

    return { players: room.players, playerNum: room.players.length };
  }

  leaveRoom(socketId: string): string | null {
    for (const [code, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === socketId);

      if (playerIndex !== -1) {
        // If leader leaves, terminate the room
        if (room.players[playerIndex].isLeader) {
          this.rooms.delete(code);
          return code; // Signal that room was terminated
        }

        // Remove player from room
        room.players.splice(playerIndex, 1);

        // If room is empty, delete it
        if (room.players.length === 0) {
          this.rooms.delete(code);
        }

        return code;
      }
    }

    return null;
  }

  getRoomByCode(code: string): RoomData | null {
    return this.rooms.get(code.toUpperCase()) || null;
  }

  getRoomBySocketId(socketId: string): RoomData | null {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.id === socketId)) {
        return room;
      }
    }
    return null;
  }

  deleteRoom(code: string): void {
    this.rooms.delete(code.toUpperCase());
  }

  getAllRooms(): RoomData[] {
    return Array.from(this.rooms.values());
  }
}
