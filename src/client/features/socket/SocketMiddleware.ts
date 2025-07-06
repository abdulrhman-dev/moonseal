import type { Middleware } from "@reduxjs/toolkit";
import {
  connectionEstablished,
  connectionLost,
  initSocket,
} from "../SocketSlice";
import type { SocketInterface } from "./SocketFactory";
import SocketFactory from "./SocketFactory";
import { changeList } from "../GameSlice";

const socketMiddleware: Middleware = (store) => {
  let socket: SocketInterface;

  return (next) => (action) => {
    if (initSocket.match(action)) {
      if (!socket && typeof window !== undefined) {
        socket = SocketFactory.create();

        socket.socket.on("connect", () => {
          store.dispatch(connectionEstablished());
        });

        socket.socket.on("disconnect", (reason) => {
          store.dispatch(connectionLost());
        });

        socket.socket.on("listChange", (data) => {
          store.dispatch(changeList(data));
        });
      }
    }

    next(action);
  };
};

export default socketMiddleware;
