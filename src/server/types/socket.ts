import type { CardLocations } from "@/components/Card";
import type { CardState } from "./cards";

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

export interface ServerToClientEvents {
  listChange: (data: listChangeArgs) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}
