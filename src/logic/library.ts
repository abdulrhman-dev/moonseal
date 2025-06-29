// types
import type { CardState } from "@/types/cards";
import { CardStateDefault } from "@/types/cards";

// redux
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { shuffleLibary, pushLibrary } from "@/store/PlayersSlice";

import { deck } from "@/deck";

export const getCardData = async (
  playerCards: CardState[],
  dispatch: Dispatch<UnknownAction>
) => {
  if (playerCards.length > 0) return;

  for (const key of Object.keys(deck)) {
    const cardImport = await import(`../cards/logic/card_${key}`);
    const card = cardImport.default;

    // deleting non serializable props
    delete card["cast"];
    delete card["triggers"];
    delete card["valid"];

    // Adding extra props associated with card state
    const cardInput: CardState = {
      ...card,
      ...CardStateDefault,
      power: card.default_power,
      toughness: card.default_toughness,
    };

    type keysType = keyof typeof deck;
    // let count = deck[key as keysType];
    let count = 5;

    while (count--) dispatch(pushLibrary({ player: 1, card: cardInput }));
    break;
  }

  dispatch(shuffleLibary({ player: 1 }));
};
