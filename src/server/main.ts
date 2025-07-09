import express from "express";
import ViteExpress from "vite-express";

import { Server, type Socket } from "socket.io";
import Game from "./classes/Game";
import http from "http";
import {
  type ClientToServerEvents,
  type ServerSocket,
  type ServerToClientEvents,
} from "./types/socket";
import registerHandleGame from "./socket/handleGame";
import { gameListeners } from "./socket/gameListeners";

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

let connectionLimit = 2;
let playerSockets: ServerSocket[] = [];

function getPlayerNum() {
  if (playerSockets.length === 0) return 1;
  else return playerSockets[0].data.playerNum ^ 3;
}

function unRegisterEvents() {
  for (const listener of gameListeners) {
    for (const playerSocket of playerSockets) {
      playerSocket.removeAllListeners(listener);
    }
  }
}

io.on("connect", async (socket: ServerSocket) => {
  if (!connectionLimit) return;

  console.log("SOCKET CONNECTED", socket.id);
  socket.data.playerNum = getPlayerNum();

  connectionLimit--;
  playerSockets.push(socket);

  socket.on("disconnect", () => {
    console.log("SOCKET DISCONNECTED", socket.id);
    unRegisterEvents();
    connectionLimit++;
    playerSockets = playerSockets.filter(
      (playerSocket) => playerSocket.id !== socket.id
    );
  });

  if (connectionLimit === 0) {
    registerHandleGame(io, playerSockets);
  }
});
