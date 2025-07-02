import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";
import {
  type Card as CardType,
  type CardTypes,
  type CardState,
  type Mana,
  ManaDefault,
} from "@/types/cards";
import type { Player } from "@/store/PlayersSlice";
import type { Phases } from "@/types/phases";

const fastSpells: CardTypes[] = ["instant"] as const;

export const canCast = async (
  card: CardState,
  spellStackLength: number,
  currPhase: Phases,
  player: Player,
  isActive: boolean
): Promise<boolean> => {
  if (card.type === "land")
    return (
      (currPhase === "MAIN_PHASE_1" || currPhase === "MAIN_PHASE_2") &&
      spellStackLength === 0 &&
      player.landsCasted <= 0 &&
      isActive
    );

  if (spellStackLength === 0) {
    if (!isActive) return false;

    if (
      currPhase !== "MAIN_PHASE_1" &&
      currPhase !== "MAIN_PHASE_2" &&
      !fastSpells.includes(card.type)
    )
      return false;
  } else if (!fastSpells.includes(card.type)) {
    return false;
  }

  // Getting all avaliable mana
  const mana: Required<Mana> = {
    ...ManaDefault,
    ...player.mana,
  };

  type ManaKeyValue = [keyof Mana, number];

  player.battlefield.lands.forEach((land) => {
    if (land.tapped === true) return;

    for (const [key, value] of Object.entries(
      land.manaGiven
    ) as ManaKeyValue[]) {
      mana[key] += value;
    }
  });

  // Removing appropriate mana
  for (const [key, value] of Object.entries(card.manaCost) as ManaKeyValue[]) {
    if (key === "colorless") continue;

    mana[key] -= value;

    if (mana[key] < 0) return false;
  }

  const remaningMana = Object.values(mana).reduce(
    (prev, curr) => prev + curr,
    0
  );
  // Checking the outcome
  const cardImport = await import(
    `../../cards/logic/card_${card.gameId}_${card.name}`
  );
  const cardData = cardImport.default as CardType;

  if (card.manaCost.colorless && card.manaCost.colorless <= remaningMana)
    return cardData.valid();

  return !card.manaCost.colorless || false;
};

const useCanCast = (card: CardState, cardPlayer: 1 | 2) => {
  const [castStyle, setCastStyle] = useState(Boolean);

  const player = useSelector(
    (state: RootState) => state.players.player[cardPlayer - 1]
  );

  const currPlayer = useSelector(
    (state: RootState) => state.players.current_player
  );

  const priority = useSelector((state: RootState) => state.players.priority);

  const currPhase = useSelector(
    (state: RootState) => state.players.current_phase
  );

  const declaredAttackers = useSelector(
    (state: RootState) => state.players.declaredAttackers
  );

  const declaredBlockers = useSelector(
    (state: RootState) => state.players.declaredBlockers
  );

  const spellStackLength = useSelector(
    (state: RootState) => state.players.spell_stack.length
  );

  useEffect(() => {
    (async () => {
      if (
        (currPhase === "COMBAT_ATTACK" && !declaredAttackers) ||
        (currPhase === "COMBAT_BLOCK" && !declaredBlockers) ||
        cardPlayer !== priority
      ) {
        setCastStyle(false);
        return;
      }

      const shouldCast = await canCast(
        card,
        spellStackLength,
        currPhase,
        player,
        cardPlayer === currPlayer
      );

      if (shouldCast) setCastStyle(true);
      else setCastStyle(false);
    })();
  }, [
    player,
    currPhase,
    priority,
    currPlayer,
    declaredAttackers,
    declaredBlockers,
  ]);

  return castStyle;
};

export default useCanCast;
