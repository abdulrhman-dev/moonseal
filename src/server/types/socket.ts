import type { CardResolveArgs, CardState } from "./cards";
import type { Socket, Server } from "socket.io";
import type { Phases } from "./phases";
import type { ClientStack, Fight, PlayerMana } from "@/features/GameSlice";
import type { StackCardTypeProp } from "@backend/classes/Stack";
import type { InitilizeTargetingArgs, Target } from "@/features/TargetingSlice";

export type listChangeArgs =
  | {
      type: "player" | "opposing";
      listName: "hand" | "exile" | "graveyard" | "lookup";
      list: CardState[];
    }
  | {
      type: "player" | "opposing";
      listName: "battlefield";
      list: { creatures: CardState[]; lands: CardState[] };
    }
  | {
      listName: "stack";
      list: ClientStack[];
    };

export type priorityChangeArgs = { phase: Phases; priority: 1 | 2 };

export type activePlayerChangeArgs = { activePlayer: boolean };

export type fightChangeArgs = {
  fights: Fight[];
  declaredAttackers: boolean;
  declaredBlockers: boolean;
  declaredDamageAssign: boolean;
};

export type playerChangeArgs = {
  player: {
    mana: PlayerMana;
    life: number;
    ready: boolean;
  };
  opponenet: {
    life: number;
    ready: boolean;
  };
};
export interface ServerToClientEvents {
  "list:change": (data: listChangeArgs) => void;
  "priority:change": (data: priorityChangeArgs) => void;
  "active-player:change": (data: activePlayerChangeArgs) => void;
  "fight:change": (data: fightChangeArgs) => void;
  "player:change": (data: playerChangeArgs) => void;
  "targeting:change": (data: InitilizeTargetingArgs) => void;
}

export interface ClientToServerEvents {
  "next-phase:action": () => void;
  "cast-spell:action": (data: {
    id: number;
    type: StackCardTypeProp;
    args: CardResolveArgs;
  }) => void;
  "set-declared-attackers:action": () => void;
  "set-declared-blockers:action": () => void;
  "toggle-blocker:action": (data: {
    blockerId: number;
    attackerId: number;
  }) => void;
  "toggle-attacker:action": (data: { attackerId: number }) => void;
  "turn-skip:action": (data: {
    autoPassPriority: boolean;
    autoResolvePriority: boolean;
  }) => void;
  "mulligan:action": () => void;
  "set-ready:action": () => void;
  "send-targets:action": (targets: Target[]) => void;
  "assign-damage:action": (fights: Fight[]) => void;
}

export type ClientSocketEmitArgs = {
  [K in keyof ClientToServerEvents]: Parameters<
    ClientToServerEvents[K]
  > extends [infer DataType]
    ? {
        name: K;
        data: DataType;
      }
    : { name: K; data?: undefined };
}[keyof ClientToServerEvents];

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
