import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";
import {
  type Card as CardType,
  type CardTypes,
  type CardState,
} from "@/types/cards";
import type { Player } from "@/store/PlayersSlice";
import type { Phases } from "@/types/phases";
import { checkMana } from "../logic/manaLogic";

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
    if (!isActive && !fastSpells.includes(card.type)) return false;

    if (
      currPhase !== "MAIN_PHASE_1" &&
      currPhase !== "MAIN_PHASE_2" &&
      !fastSpells.includes(card.type)
    )
      return false;
  } else if (!fastSpells.includes(card.type)) {
    return false;
  }

  const cardImport = await import(
    `../../cards/logic/card_${card.gameId}_${card.name}`
  );
  const cardData = cardImport.default as CardType;

  return checkMana(player, card.manaCost) && cardData.valid({ card });
};

const useCanCast = (card: CardState, cardPlayer: 0 | 1 | 2) => {
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

  const spellStack = useSelector(
    (state: RootState) => state.players.spell_stack
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!cardPlayer) return;
      if (
        spellStack.length &&
        spellStack[spellStack.length - 1].type === "SHOWCASE"
      ) {
        setCastStyle(false);
        return;
      }

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
        spellStack.length,
        currPhase,
        player,
        cardPlayer === currPlayer
      );

      if (!mounted) return;

      console.log(currPhase, cardPlayer, priority);
      if (shouldCast) setCastStyle(true);
      else setCastStyle(false);
    })();

    return () => {
      mounted = false;
    };
  }, [
    player,
    currPhase,
    priority,
    currPlayer,
    spellStack,
    declaredAttackers,
    declaredBlockers,
  ]);

  return castStyle;
};

export default useCanCast;
