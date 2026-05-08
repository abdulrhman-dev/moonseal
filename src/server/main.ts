import express from "express";
import ViteExpress from "vite-express";

import { Server } from "socket.io";
import Game from "./classes/Game";
import http from "http";
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "./types/socket";
import registerHandleGame from "./socket/handleGame";
import { gameListeners } from "./socket/gameListeners";
import { registerRoomHandlers } from "./socket/roomHandlers";
import { RoomManager } from "./classes/RoomManager";
import "dotenv/config";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`CONNECTED ON PORT ${PORT}`);
});

ViteExpress.bind(app, server);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);
const roomManager = new RoomManager();

// Register room handlers
registerRoomHandlers(io, roomManager);
