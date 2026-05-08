import type {
  ClientSocketEmitArgs,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@backend/types/socket";
import { io, Socket } from "socket.io-client";

export interface SocketInterface {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

class SocketConnection implements SocketInterface {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  socketEndpoint = "http://localhost:3000/";

  constructor() {
    this.socket = io(this.socketEndpoint);
  }
}

let socketConnection: SocketConnection | undefined;

class SocketFactory {
  public static create(): SocketConnection {
    if (!socketConnection) {
      socketConnection = new SocketConnection();

      return socketConnection;
    }

    return socketConnection;
  }
}

export const socketEmit = (args: ClientSocketEmitArgs) => {
  if (!socketConnection) return;

  if (args.data) socketConnection.socket.emit(args.name, args.data);
  else socketConnection.socket.emit(args.name);
};

export default SocketFactory;
