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

export function getRecentCard(targetId: number) {
  const state = store.getState().players;

  for (const player of [1, 2]) {
    for (const location of ["graveyard", "library", "hand", "exile"] as const) {
      const cardIndex = state.player[player - 1][location].findIndex(
        (card) => card.id === targetId
      );

      if (cardIndex !== -1) {
        return state.player[player - 1][location][cardIndex];
      }
    }

    for (const location of ["creatures", "lands"] as const) {
      const cardIndex = state.player[player - 1].battlefield[
        location
      ].findIndex((card) => card.id === targetId);

      if (cardIndex !== -1) {
        return state.player[player - 1].battlefield[location][cardIndex];
      }
    }
  }
}

export function getRecentEnchantment(targetId: number) {
  const state = store.getState().players;

  for (const player of [1, 2]) {
    for (const location of ["graveyard", "library", "hand", "exile"] as const) {
      for (const card of state.player[player - 1][location]) {
        const cardIndex = card.enchanters.findIndex(
          (card) => card.id === targetId
        );

        if (cardIndex !== -1) {
          return card.enchanters[cardIndex];
        }
      }
    }

    for (const location of ["creatures", "lands"] as const) {
      for (const card of state.player[player - 1].battlefield[location]) {
        const cardIndex = card.enchanters.findIndex(
          (card) => card.id === targetId
        );

        if (cardIndex !== -1) {
          return card.enchanters[cardIndex];
        }
      }
    }
  }
}
