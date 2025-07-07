import type { RootState } from "@/features/store";
import { useDispatch, useSelector } from "react-redux";

import Style from "@/css/app.module.css";
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
  }>(
    game.isActive
      ? { style: Style.redButton, buttonText: "Next" }
      : { style: Style.blueButton, buttonText: "Pass" }
  );

  async function handleButtonClick() {
    if (game.currentPhase === "COMBAT_ATTACK" && !game.declaredAttackers) {
      socketEmit({ name: "set-declared-attackers:action" });
      return;
    }

    if (game.currentPhase === "COMBAT_BLOCK" && !game.declaredBlockers) {
      socketEmit({ name: "set-declared-blockers:action" });
      return;
    }

    socketEmit({ name: "next-phase:action" });

    setButtonData({
      style: Style.blueButton,
      buttonText: "Pass",
    });
  }

  useEffect(() => {
    if (game.currentPhase === "COMBAT_ATTACK" && !game.declaredAttackers) {
      setButtonData({
        style: Style.redButton,
        buttonText: "Declare Attackers",
      });
      return;
    }

    if (game.currentPhase === "COMBAT_BLOCK" && !game.declaredBlockers) {
      setButtonData({
        style: Style.blueButton,
        buttonText: "Declare Blockers",
      });
      return;
    }

    if (game.isActive) {
      setButtonData({
        style: Style.redButton,
        buttonText: "Next",
      });
    } else {
      setButtonData({
        style: Style.blueButton,
        buttonText: "Pass",
      });
    }
  }, [
    game.priority,
    game.currentPhase,
    game.declaredAttackers,
    game.declaredBlockers,
  ]);

  const defending =
    !game.isActive &&
    game.currentPhase === "COMBAT_BLOCK" &&
    !game.declaredBlockers;

  console.log("DEFENDING: ", defending);
  if (
    (game.priority === 1 &&
      (game.currentPhase === "COMBAT_BLOCK" ? game.declaredBlockers : true)) ||
    defending
  ) {
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
