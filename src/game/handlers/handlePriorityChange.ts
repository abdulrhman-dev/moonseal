import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import {
  addToBattleField,
  attachEnchantment,
  resolveSpell,
  type PlayersState,
  type StackAbility,
} from "@/store/PlayersSlice";
import type { Card } from "@/types/cards";
import type { TriggerNames } from "@/types/triggers";
import { addTrigger } from "@/store/TriggerSlice";

export const resolveTopCard = async (
  stackTop: StackAbility,
  dispatch: Dispatch
) => {
  const cardImport = await import(
    `../../cards/logic/card_${stackTop.card.gameId}_${stackTop.card.name}`
  );

  const card = cardImport.default as Card;

  card.resolve({ ...stackTop.args });

  // TODO: add triggers
  for (const trigger of Object.keys(card.triggers) as TriggerNames[]) {
    dispatch(
      addTrigger({
        data: {
          id: stackTop.card.id,
          game_id: stackTop.card.gameId,
          name: stackTop.card.name,
          args: stackTop.args,
        },
        name: trigger,
      })
    );
  }

  if (
    card.type === "enchantment" &&
    card.keywords.includes("Enchant") &&
    stackTop.args.targets &&
    stackTop.args.targets.length === 1
  ) {
    const cardType =
      stackTop.args.targets[0].type === "creature" ? "creatures" : "lands";
    dispatch(
      attachEnchantment({
        card: stackTop.card,
        targetId: stackTop.args.targets[0].id,
        type: cardType,
      })
    );
  }

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
