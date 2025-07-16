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
      }
    }

    next(action);
  };
};

export default socketMiddleware;
