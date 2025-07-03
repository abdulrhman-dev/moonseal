import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import {
  addToBattleField,
  resolveSpell,
  type PlayersState,
  type StackAbility,
} from "@/store/PlayersSlice";
import type { Card } from "@/types/cards";

export const resolveTopCard = async (
  stackTop: StackAbility,
  dispatch: Dispatch
) => {
  const cardImport = await import(
    `../../cards/logic/card_${stackTop.card.gameId}_${stackTop.card.name}`
  );

  const card = cardImport.default as Card;

  card.resolve({ ...stackTop.args });

  if (card.type === "creature") dispatch(addToBattleField(stackTop.card));

  dispatch(resolveSpell());
};

export default function (
  players: PlayersState,
  dispatch: Dispatch<UnknownAction>
) {
  (async () => {
    if (players.priorityPassNum >= 2 && players.spell_stack.length) {
      const stackTop = players.spell_stack[players.spell_stack.length - 1];
      if (stackTop.type === "CAST") {
        resolveTopCard(stackTop, dispatch);
      }
    }
  })();
}
