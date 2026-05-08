import { type Middleware } from "@reduxjs/toolkit";
import {
  connectionEstablished,
  connectionLost,
  initSocket,
} from "../SocketSlice";
import type { SocketInterface } from "./SocketFactory";
import SocketFactory from "./SocketFactory";
import {
  changeActive,
  changeFights,
  changeList,
  changePlayers,
  changePriority,
} from "../GameSlice";
import { initilizeTargets } from "../TargetingSlice";
import {
  roomCreated,
  roomJoined,
  playerJoined,
  playerLeft,
  gameStarted,
  roomError,
} from "../RoomSlice";

const socketMiddleware: Middleware = (store) => {
  let socket: SocketInterface;

  return (next) => (action) => {
    if (initSocket.match(action)) {
      if (!socket && typeof window !== undefined) {
        socket = SocketFactory.create();

        socket.socket.on("connect", () => {
          console.log("Socket Connected");
          store.dispatch(connectionEstablished());
        });

        socket.socket.on("disconnect", () => {
          store.dispatch(connectionLost());
        });

        socket.socket.on("list:change", (data) => {
          store.dispatch(changeList(data));
        });

        socket.socket.on("priority:change", (data) => {
          store.dispatch(changePriority(data));
        });

        socket.socket.on("active-player:change", (data) => {
          store.dispatch(changeActive(data));
        });

        socket.socket.on("fight:change", (data) => {
          store.dispatch(changeFights(data));
        });

        socket.socket.on("player:change", (data) => {
          store.dispatch(changePlayers(data));
        });

        socket.socket.on("targeting:change", (data) => {
          store.dispatch(initilizeTargets(data));
        });

        // Room event handlers
        socket.socket.on("room:created", (data) => {
          store.dispatch(roomCreated(data));
        });

        socket.socket.on("room:joined", (data) => {
          store.dispatch(roomJoined(data));
        });

        socket.socket.on("room:player-joined", (data) => {
          store.dispatch(playerJoined(data));
        });

        socket.socket.on("room:player-left", (data) => {
          store.dispatch(playerLeft(data));
        });

        socket.socket.on("room:game-started", () => {
          store.dispatch(gameStarted());
        });

        socket.socket.on("room:error", (data) => {
          store.dispatch(roomError(data));
        });
      }
    }

    next(action);
  };
};

export default socketMiddleware;
