// types
import type { CardState } from "@/types/cards";
import { CardStateDefault } from "@/types/cards";

// redux
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { shuffleLibary, pushLibrary, startGame } from "@/store/PlayersSlice";

import { deck } from "@/deck";

export const getCardData = async (dispatch: Dispatch<UnknownAction>) => {
  for (const player of [1, 2] as const) {
    for (const key of Object.keys(deck)) {
      const cardImport = await import(`../../cards/logic/card_${key}`);
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
      let count = deck[key as keysType];

      while (count--) dispatch(pushLibrary({ player, card: cardInput }));
    }

    dispatch(shuffleLibary({ player }));
  }

  dispatch(startGame());
};
