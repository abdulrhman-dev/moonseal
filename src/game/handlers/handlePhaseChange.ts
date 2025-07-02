import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import type { PlayersState } from "@/store/PlayersSlice";

import {
  calculateDamage,
  cleanUpCombat,
  drawCard,
  healCreatures,
  nextPhase,
  passPriority,
  removeSummoningSickness,
  setDeclaredAttackers,
  setDeclaredBlockers,
  unTapCards,
} from "@/store/PlayersSlice";
import {
  checkCanAttack,
  checkCanBlock,
  checkNeedPriority,
} from "../logic/checkBoard";
import type { Phases } from "@/types/phases";

const fastPhases: Phases[] = [
  "BEGINNING_UNTAP",
  "BEGINNING_UNKEEP",
  "BEGINNING_DRAW",
  "COMBAT_BEGIN",
  "COMBAT_END",
  "END_STEP",
  "COMBAT_DAMAGE",
  "COMBAT_ATTACK",
  "COMBAT_BLOCK",
] as const;

export default function (
  players: PlayersState,
  dispatch: Dispatch<UnknownAction>
) {
  if (players.current_phase === "NONE") return;

  switch (players.current_phase) {
    case "BEGINNING_UNTAP":
      dispatch(removeSummoningSickness());
      dispatch(unTapCards());
      break;
    case "BEGINNING_DRAW":
      if (players.player[players.current_player - 1].turn !== 1)
        dispatch(drawCard());
      break;
    case "COMBAT_ATTACK":
      if (!checkCanAttack(players)) dispatch(setDeclaredAttackers());
      break;
    case "COMBAT_BLOCK":
      if (!checkCanBlock(players)) dispatch(setDeclaredBlockers());
      break;
    case "COMBAT_DAMAGE":
      dispatch(calculateDamage());
      dispatch(cleanUpCombat());
      break;
    case "CLEANUP":
      dispatch(healCreatures());
      dispatch(nextPhase());
      break;
  }
  (async () => {
    if (players.current_phase === "COMBAT_ATTACK" && checkCanAttack(players))
      return;
    if (players.current_phase === "COMBAT_BLOCK" && checkCanBlock(players))
      return;

    if (fastPhases.includes(players.current_phase) && players.current_player) {
      const currNeedPriority = await checkNeedPriority(
        players,
        players.current_player
      );
      const nextNeedPriority = await checkNeedPriority(
        players,
        (players.priority ^ 3) as 1 | 2
      );

      if (!currNeedPriority) dispatch(passPriority());

      if (!nextNeedPriority) dispatch(passPriority());

      if (!currNeedPriority && !nextNeedPriority) dispatch(nextPhase());
    }
  })();
}
