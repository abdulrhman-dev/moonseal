import type { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  nextPhase,
  passPriority,
  setDeclaredAttackers,
  setDeclaredBlockers,
} from "@/store/PlayersSlice";

import Style from "@/css/app.module.css";
import { checkNeedPriority } from "@/game/logic/checkBoard";
import { useEffect, useState } from "react";

export const PhaseButton = () => {
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.players);
  const targetsRules = useSelector(
    (state: RootState) => state.targeting.targetsRules
  );

  const [buttonData, setButtonData] = useState<{
    style: string;
    buttonText: string;
  }>({ style: "", buttonText: "" });

  async function handleButtonClick() {
    if (
      players.current_phase === "COMBAT_ATTACK" &&
      !players.declaredAttackers
    ) {
      dispatch(setDeclaredAttackers());
      return;
    }

    if (players.current_phase === "COMBAT_BLOCK" && !players.declaredBlockers) {
      dispatch(setDeclaredBlockers());
      return;
    }

    if (!players.current_player) return;

    if (!players.spell_stack.length) {
      const nextNeedPriority = await checkNeedPriority(
        players,
        (players.priority ^ 3) as 1 | 2
      );

      if (players.priorityPassNum >= 1) {
        dispatch(nextPhase());
        return;
      }

      dispatch(passPriority());

      if (!nextNeedPriority) {
        dispatch(passPriority());
        dispatch(nextPhase());
      }
    } else {
      dispatch(passPriority());
    }
  }

  useEffect(() => {
    if (
      players.current_phase === "COMBAT_ATTACK" &&
      !players.declaredAttackers
    ) {
      setButtonData({
        style: Style.redButton,
        buttonText: "Declare Attackers",
      });
      return;
    }

    if (players.current_phase === "COMBAT_BLOCK" && !players.declaredBlockers) {
      setButtonData({
        style: Style.blueButton,
        buttonText: "Declare Blockers",
      });
      return;
    }

    if (!players.priorityPassNum) {
      setButtonData({
        style: Style.redButton,
        buttonText: "Next",
      });
      return;
    } else {
      setButtonData({
        style: Style.blueButton,
        buttonText: "Pass",
      });
      return;
    }
  }, [players]);

  return (
    <button
      onClick={handleButtonClick}
      className={Style.phaseButton + " " + buttonData.style}
      style={{
        [players.priority ===
        (1 ^
          (players.current_phase === "COMBAT_BLOCK" && !players.declaredBlockers
            ? 3
            : 0))
          ? "bottom"
          : "top"]: 20,
      }}
      disabled={
        (players.spell_stack.length > 0 &&
          players.spell_stack[players.spell_stack.length - 1].type ===
            "SHOWCASE") ||
        targetsRules.reduce(
          (prev, targetRule) => targetRule.amount !== 0 || prev,
          false
        )
      }
    >
      {buttonData.buttonText}
    </button>
  );
};
