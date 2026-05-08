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

const app = express();

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

const server = http.createServer(app);

server.listen(3000, () => {
  console.log("CONNECTED ON PORT 3000");
});

ViteExpress.bind(app, server);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);
const roomManager = new RoomManager();

// Register room handlers
registerRoomHandlers(io, roomManager);
