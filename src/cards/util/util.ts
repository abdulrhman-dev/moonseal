import { store } from "@/store/store";
import type { CardState } from "@/types/cards";

export function validTargets(targets: CardState[]) {
  const players = store.getState().players;
  for (const target of targets) {
    for (const player of [1, 2] as const) {
      if (
        players.player[player - 1].graveyard.find(
          (card) => target.id === card.id
        )
      )
        return false;
      if (
        players.player[player - 1].graveyard.find(
          (card) => target.id === card.id
        )
      )
        return false;
    }
  }

  return true;
}
