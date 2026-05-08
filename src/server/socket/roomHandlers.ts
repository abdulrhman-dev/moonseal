import { type IO, type ServerSocket } from "../types/socket";
import { RoomManager } from "../classes/RoomManager";
import registerHandleGame from "./handleGame";

export function registerRoomHandlers(io: IO, roomManager: RoomManager) {
  io.on("connection", (socket: ServerSocket) => {
    console.log("SOCKET CONNECTED", socket.id);

    // Handle room creation
    socket.on("room:create", (data: { username: string }) => {
      const { code, playerNum } = roomManager.createRoom(
        socket.id,
        data.username,
      );
      socket.data.username = data.username;
      socket.data.roomCode = code;
      socket.data.playerNum = playerNum;

      // Join socket to room namespace
      socket.join(code);

      // Get the room to send player data back to client
      const room = roomManager.getRoomByCode(code);
      const players = room?.players || [];

      socket.emit("room:created", { code, playerNum, players });
      console.log(`Room created: ${code} by ${data.username}`);
    });

    // Handle room join
    socket.on("room:join", (data: { code: string; username: string }) => {
      const result = roomManager.joinRoom(data.code, socket.id, data.username);

      if (!result) {
        socket.emit("room:error", { message: "Room not found or is full" });
        return;
      }

      socket.data.username = data.username;
      socket.data.roomCode = data.code.toUpperCase();
      socket.data.playerNum = result.playerNum;

      socket.emit("room:joined", {
        players: result.players,
        playerNum: result.playerNum,
        code: data.code.toUpperCase(),
      });

      // Join socket to room namespace BEFORE emitting to room
      socket.join(data.code.toUpperCase());

      // Notify other players in the room
      io.to(data.code.toUpperCase()).emit("room:player-joined", {
        players: result.players,
      });

      console.log(`Player ${data.username} joined room ${data.code}`);
    });

    // Handle room leave
    socket.on("room:leave", () => {
      const roomCode = socket.data.roomCode;
      const username = socket.data.username;

      if (!roomCode) return;

      const result = roomManager.leaveRoom(socket.id);

      if (result) {
        socket.leave(roomCode);

        const room = roomManager.getRoomByCode(roomCode);
        if (room) {
          // Room still exists, notify remaining players
          io.to(roomCode).emit("room:player-left", {
            players: room.players,
          });
          console.log(`Player ${username} left room ${roomCode}`);
        } else {
          // Room was terminated (leader left)
          io.to(roomCode).emit("room:error", {
            message: "Leader left the room. Room terminated.",
          });
          console.log(`Room ${roomCode} terminated (leader left)`);
        }
      }

      socket.data.roomCode = undefined;
      socket.data.username = undefined;
      socket.data.playerNum = undefined;
    });

    // Handle game start
    socket.on("room:start-game", async () => {
      const roomCode = socket.data.roomCode;

      if (!roomCode) {
        socket.emit("room:error", { message: "Not in a room" });
        return;
      }

      const room = roomManager.getRoomByCode(roomCode);
      if (!room) {
        socket.emit("room:error", { message: "Room not found" });
        return;
      }

      // Check if user is the leader
      const leader = room.players.find((p) => p.isLeader);
      if (leader?.id !== socket.id) {
        socket.emit("room:error", {
          message: "Only the leader can start the game",
        });
        return;
      }

      // Check if there are 2 players
      if (room.players.length !== 2) {
        socket.emit("room:error", {
          message: "Need 2 players to start the game",
        });
        return;
      }

      // Get the player sockets from the room
      const playerSockets: ServerSocket[] = [];
      for (const player of room.players) {
        // Find the socket for this player
        const playerSocket = io.sockets.sockets.get(player.id) as ServerSocket;
        if (playerSocket) {
          // Assign player numbers to match room setup
          // First player in room is player 1, second is player 2
          playerSocket.data.playerNum = room.players.indexOf(player) + 1;
          // For now, all players use deck 1 (first deck, 1-indexed)
          playerSocket.data.deckNumber = 1;
          playerSockets.push(playerSocket);
        }
      }

      if (playerSockets.length !== 2) {
        socket.emit("room:error", {
          message: "Could not find all player sockets",
        });
        return;
      }

      // Notify all players in the room that the game is starting
      io.to(roomCode).emit("room:game-started");
      console.log(`Game starting in room ${roomCode}`);

      // Initialize the game
      await registerHandleGame(io, playerSockets);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED", socket.id);
      const roomCode = socket.data.roomCode;

      if (roomCode) {
        const result = roomManager.leaveRoom(socket.id);

        if (result) {
          const room = roomManager.getRoomByCode(roomCode);
          if (room) {
            io.to(roomCode).emit("room:player-left", {
              players: room.players,
            });
          } else {
            io.to(roomCode).emit("room:error", {
              message: "Leader left the room. Room terminated.",
            });
          }
        }
      }
    });
  });
}
