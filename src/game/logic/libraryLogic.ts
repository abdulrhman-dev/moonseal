// types
import type { CardState } from "@/types/cards";
import { CardStateDefault } from "@/types/cards";

// redux
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { shuffleLibary, pushLibrary, startGame } from "@/store/PlayersSlice";

import { decks } from "@/deck";

export const getCardData = async (dispatch: Dispatch<UnknownAction>) => {
  for (const player of [1, 2] as const) {
    const deck = decks[player];
    for (const deck_card of deck) {
      const cardImport = await import(
        `../../cards/logic/card_${deck_card.id}_${deck_card.name}`
      );
      const orgCard = cardImport.default;
      const card = { ...orgCard };
      // deleting non serializable props
      delete card["resolve"];
      delete card["triggers"];
      delete card["valid"];

      // Adding extra props associated with card state
      const cardInput: CardState = {
        ...card,
        ...CardStateDefault,
        power: card.defaultPower,
        toughness: card.defaultToughness,
        cardPlayer: player,
      };

      let count = deck_card.amount;

      while (count--) dispatch(pushLibrary({ player, card: cardInput }));
    }

    dispatch(shuffleLibary({ player }));
  }

  dispatch(startGame());
};
