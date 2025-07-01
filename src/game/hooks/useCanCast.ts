import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";
import {
  type Card as CardType,
  type CardState,
  type Mana,
  ManaDefault,
} from "@/types/cards";
import type { Player } from "@/store/PlayersSlice";

export const canCast = async (card: CardState, player: Player) => {
  if (card.type === "land") return player.landsCasted <= 0;
  // Getting all avaliable mana
  const mana: Required<Mana> = {
    ...ManaDefault,
    ...player.mana,
  };

  type ManaKeyValue = [keyof Mana, number];

  player.battlefield.lands.forEach((land) => {
    console.log("TAPPED", land.tapped === true);
    if (land.tapped === true) return;

    for (const [key, value] of Object.entries(
      land.mana_given
    ) as ManaKeyValue[]) {
      mana[key] += value;
    }
  });

  // Removing appropriate mana
  for (const [key, value] of Object.entries(card.mana_cost) as ManaKeyValue[]) {
    if (key === "colorless") continue;

    mana[key] -= value;

    if (mana[key] < 0) return false;
  }

  const remaningMana = Object.values(mana).reduce(
    (prev, curr) => prev + curr,
    0
  );
  console.log(remaningMana);
  // Checking the outcome
  const cardImport = await import(`../../cards/logic/card_${card.game_id}`);
  const cardData = cardImport.default as CardType;

  if (card.mana_cost.colorless && card.mana_cost.colorless <= remaningMana)
    return cardData.valid();

  return !card.mana_cost.colorless || false;
};

const useCanCast = (card: CardState, cardPlayer: 1 | 2) => {
  const [castStyle, setCastStyle] = useState(Boolean);

  const player = useSelector(
    (state: RootState) => state.players.player[cardPlayer - 1]
  );

  const currPlayer = useSelector(
    (state: RootState) => state.players.current_player
  );

  const currPhase = useSelector(
    (state: RootState) => state.players.current_phase
  );

  useEffect(() => {
    (async () => {
      if (currPlayer !== cardPlayer) {
        setCastStyle(false);
        return;
      }

      // TODO: Handle stack case
      /*
        117.1a 
        A player may cast an instant spell any time they have priority. 
        A player may cast a noninstant spell during their main phase any time they have priority and the stack is empty.
      */
      if (currPhase !== "MAIN_PHASE_1" && currPhase !== "MAIN_PHASE_2") {
        setCastStyle(false);
        return;
      }

      const shouldCast = await canCast(card, player);

      if (shouldCast) setCastStyle(true);
      else setCastStyle(false);
    })();
  }, [player, currPhase]);

  return castStyle;
};

export default useCanCast;
