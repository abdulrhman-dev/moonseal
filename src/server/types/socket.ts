import type { CardLocations } from "@/components/Card";
import type { CardState } from "./cards";
import type { Socket, Server } from "socket.io";
import type { Phases } from "./phases";

export type listChangeArgs =
  | {
      type: "player" | "opposing";
      listName: "hand" | "exile" | "graveyard";
      list: CardState[];
    }
  | {
      type: "player" | "opposing";
      listName: "battlefield";
      list: { creatures: CardState[]; lands: CardState[] };
    };

export type priorityChangeArgs = { phase: Phases; priority: 1 | 2 };

export type activePlayerChangeArgs = { activePlayer: boolean };

export interface ServerToClientEvents {
  "list:change": (data: listChangeArgs) => void;
  "priority:change": (data: priorityChangeArgs) => void;
  "active-player:change": (data: activePlayerChangeArgs) => void;
}

export interface ClientToServerEvents {
  "next-phase:action": () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  playerNum: number;
}
export type ServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type IO = Server<ClientToServerEvents, ServerToClientEvents>;
