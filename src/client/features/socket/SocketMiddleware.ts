import {
  isAsyncThunkAction,
  isFulfilled,
  type Middleware,
} from "@reduxjs/toolkit";
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
  changePriority,
} from "../GameSlice";

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
          console.log(data);
          store.dispatch(changePriority(data));
        });

        socket.socket.on("active-player:change", (data) => {
          store.dispatch(changeActive(data));
        });

        socket.socket.on("fight:change", (data) => {
          store.dispatch(changeFights(data));
        });
      }
    }

    next(action);
  };
};

export default socketMiddleware;
