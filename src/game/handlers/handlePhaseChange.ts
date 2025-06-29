import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import type { PlayersState } from "@/store/PlayersSlice";

import { drawCard, nextPhase, unTapCards } from "@/store/PlayersSlice";

export default function (
  players: PlayersState,
  dispatch: Dispatch<UnknownAction>
) {
  if (players.current_phase === "NONE") return;

  switch (players.current_phase) {
    case "BEGINNING_UNTAP":
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
  }
}
