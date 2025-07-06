import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import {
  addToBattleField,
  attachEnchantment,
  resolveSpell,
  type PlayersState,
  type StackAbility,
} from "@/store/PlayersSlice";
import type { Card } from "@backend/types/cards";
import type { TriggerNames } from "@backend/types/triggers";
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

  // TODO: Don't forget to handle removing the triggres when a card goes to the exile/gravyard
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
      stackTop.args.targets[0][0].type === "creature" ? "creatures" : "lands";
    dispatch(
      attachEnchantment({
        card: stackTop.card,
        targetId: stackTop.args.targets[0][0].id,
        type: cardType,
      })
    );
  }

  if (card.type === "creature") dispatch(addToBattleField(stackTop.card));

  dispatch(resolveSpell());
};

export const resolveAbility = async (
  stackTop: StackAbility,
  abilityNumber: number,
  dispatch: Dispatch
) => {
  const cardImport = await import(
    `../../cards/logic/card_${stackTop.card.gameId}_${stackTop.card.name}`
  );

  const card = cardImport.default as Card;

  card.activatedActions[abilityNumber]({ ...stackTop.args });

  dispatch(resolveSpell());
};

export const handleStackResolution = (
  stackTop: StackAbility,
  dispatch: Dispatch
) => {
  if (stackTop.type === "CAST") resolveTopCard(stackTop, dispatch);

  if (Array.isArray(stackTop.type)) {
    const [type, data] = stackTop.type;

    if (type === "ACTIVATED") resolveAbility(stackTop, data, dispatch);
  }
};

export default function (
  players: PlayersState,
  dispatch: Dispatch<UnknownAction>
) {
  (async () => {
    if (players.priorityPassNum >= 2 && players.spell_stack.length) {
      const stackTop = players.spell_stack[players.spell_stack.length - 1];
      handleStackResolution(stackTop, dispatch);
    }
  })();
}
