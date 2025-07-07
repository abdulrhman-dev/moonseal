import type { RootState } from "@/features/store";
import { useDispatch, useSelector } from "react-redux";
// import {
//   nextPhase,
//   passPriority,
//   setDeclaredAttackers,
//   setDeclaredBlockers,
// } from "@/features/GameSlice";

import Style from "@/css/app.module.css";
// import { checkNeedPriority } from "@/game/logic/checkBoard";
import { useEffect, useState } from "react";
import { socketEmit } from "@/features/socket/SocketFactory";

export const PhaseButton = () => {
  const dispatch = useDispatch();
  const game = useSelector((state: RootState) => state.game);
  const targetsRules = useSelector(
    (state: RootState) => state.targeting.targetsRules
  );

  const [buttonData, setButtonData] = useState<{
    style: string;
    buttonText: string;
  }>({ style: "", buttonText: "" });

  async function handleButtonClick() {
    // if (
    //   players.current_phase === "COMBAT_ATTACK" &&
    //   !players.declaredAttackers
    // ) {
    //   dispatch(setDeclaredAttackers());
    //   return;
    // }

    // if (players.current_phase === "COMBAT_BLOCK" && !players.declaredBlockers) {
    //   dispatch(setDeclaredBlockers());
    //   return;
    // }

    // if (!players.spell_stack.length) {
    //   const nextNeedPriority = await checkNeedPriority(
    //     players,
    //     (players.priority ^ 3) as 1 | 2
    //   );

    //   if (players.priorityPassNum >= 1) {
    //     dispatch(nextPhase());
    //     return;
    //   }

    //   dispatch(passPriority());

    //   if (!nextNeedPriority) {
    //     dispatch(passPriority());
    //     dispatch(nextPhase());
    //   }
    // } else {
    //   dispatch(passPriority());
    // }

    socketEmit({ name: "next-phase:action" });
  }

  // useEffect(() => {
  //   if (
  //     players.current_phase === "COMBAT_ATTACK" &&
  //     !players.declaredAttackers
  //   ) {
  //     setButtonData({
  //       style: Style.redButton,
  //       buttonText: "Declare Attackers",
  //     });
  //     return;
  //   }

  //   if (players.current_phase === "COMBAT_BLOCK" && !players.declaredBlockers) {
  //     setButtonData({
  //       style: Style.blueButton,
  //       buttonText: "Declare Blockers",
  //     });
  //     return;
  //   }

  //   if (!players.priorityPassNum) {
  //     setButtonData({
  //       style: Style.redButton,
  //       buttonText: "Next",
  //     });
  //     return;
  //   } else {
  //     setButtonData({
  //       style: Style.blueButton,
  //       buttonText: "Pass",
  //     });
  //     return;
  //   }
  // }, [players]);

  if (game.priority === 1) {
    return (
      <button
        onClick={handleButtonClick}
        className={Style.phaseButton + " " + buttonData.style}
      >
        {buttonData.buttonText}
      </button>
    );
  }
  return <></>;
};
