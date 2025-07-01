import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import type { PlayersState } from "@/store/PlayersSlice";

import {
  calculateDamage,
  cleanUpCombat,
  drawCard,
  healCreatures,
  nextPhase,
  removeSummoningSickness,
  unTapCards,
} from "@/store/PlayersSlice";

export default function (
  players: PlayersState,
  dispatch: Dispatch<UnknownAction>
) {
  if (players.current_phase === "NONE") return;

  switch (players.current_phase) {
    case "BEGINNING_UNTAP":
      dispatch(removeSummoningSickness());
      dispatch(unTapCards());
      dispatch(nextPhase());
      break;
    case "BEGINNING_UNKEEP":
      dispatch(nextPhase());
      break;
    case "BEGINNING_DRAW":
      if (players.player[players.current_player - 1].turn !== 1)
        dispatch(drawCard());
      dispatch(nextPhase());
      break;
    case "COMBAT_BEGIN":
      dispatch(nextPhase());
      break;
    case "COMBAT_DAMAGE":
      dispatch(calculateDamage());
      dispatch(cleanUpCombat());
      break;
    case "COMBAT_END":
      dispatch(nextPhase());
      break;
    case "CLEANUP":
      dispatch(healCreatures());
      dispatch(nextPhase());
      break;
    case "END_STEP":
      dispatch(nextPhase());
      break;
  }
}
