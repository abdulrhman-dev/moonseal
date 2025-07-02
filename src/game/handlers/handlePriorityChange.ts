import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import {
  addToBattleField,
  resolveSpell,
  type PlayersState,
} from "@/store/PlayersSlice";
import type { Card } from "@/types/cards";
import { checkNeedPriority } from "../logic/checkBoard";

export default function (
  players: PlayersState,
  dispatch: Dispatch<UnknownAction>
) {
  (async () => {
    const nextNeedPriority = await checkNeedPriority(
      players,
      (players.priority ^ 3) as 1 | 2
    );

    if (
      (players.priorityPassNum >= 2 || !nextNeedPriority) &&
      players.spell_stack.length
    ) {
      const stackTop = players.spell_stack[players.spell_stack.length - 1];

      if (stackTop.type === "CAST") {
        const cardImport = await import(
          `../../cards/logic/card_${stackTop.card.gameId}_${stackTop.card.name}`
        );

        const card = cardImport.default as Card;

        card.resolve({});

        if (card.type === "creature") dispatch(addToBattleField(stackTop.card));

        dispatch(resolveSpell());
      }
    }
  })();
}
