import express from "express";
import ViteExpress from "vite-express";

import { Server, type Socket } from "socket.io";
import Game from "./classes/Game";
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "./types/socket";

const app = express();

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

const server = ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

let connectionLimit = 2;
const playerSockets: Socket<ClientToServerEvents, ServerToClientEvents>[] = [];

io.on("connect", async (socket) => {
  if (!connectionLimit) return;

  console.log("SOCKET CONNECTED");
  connectionLimit--;
  playerSockets.push(socket);

  socket.on("disconnect", () => {
    console.log("SOCKET DISCONNECTED");
    connectionLimit++;
    playerSockets.pop();
  });

  if (connectionLimit === 0) {
    console.log("STARTED GAME");
    const game = new Game();
    await game.initlizeDecks();

    game.players[0].drawCard();
    game.players[1].drawCard();

    let num = 0;

    for (const playerSocket of playerSockets) {
      playerSocket.join("game");
      playerSocket.emit("listChange", {
        type: "player",
        listName: "hand",
        list: game.players[num].hand.toCardState(),
      });
      playerSocket.emit("listChange", {
        type: "opposing",
        listName: "hand",
        list: game.players[(num + 1) % 2].hand.toEmptyCardList(),
      });
    }
  }
});
