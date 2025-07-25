import type { RootState } from "@/features/store";
import { useSelector } from "react-redux";

import Style from "@/css/app.module.css";
import { useEffect, useState, type ChangeEvent } from "react";
import { socketEmit } from "@/features/socket/SocketFactory";

export const PhaseButton = () => {
  const [turnSkip, setTurnSkip] = useState({
    autoPassPriority: false,
    autoResolvePriority: false,
  });

  const game = useSelector((state: RootState) => state.game);
  const targetsRules = useSelector(
    (state: RootState) => state.targeting.targetsRules
  );

  const handleAutoPassCheck = (e: ChangeEvent<HTMLInputElement>) => {
    const newTurnSkip = {
      ...turnSkip,
      autoPassPriority: !turnSkip.autoPassPriority,
    };

    socketEmit({ name: "turn-skip:action", data: newTurnSkip });
    setTurnSkip(newTurnSkip);
  };

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

    if (game.currentPhase === "COMBAT_DAMAGE" && !game.declaredAssignDamage) {
      console.log(game.fights);
      socketEmit({ name: "assign-damage:action", data: game.fights });
      return;
    }

    socketEmit({ name: "next-phase:action" });
  }

  function isDisabled() {
    const targetOnShowcase =
      game.spellStack.length > 0 &&
      game.spellStack[game.spellStack.length - 1].type === "SHOWCASE";

    if (targetOnShowcase) return true;

    const targetsFullfuiled = targetsRules.reduce(
      (prev, targetRule) => targetRule.amount !== 0 || prev,
      false
    );

    if (targetsFullfuiled) return true;

    if (game.currentPhase === "COMBAT_DAMAGE") {
      for (const fight of game.fights) {
        const totalDamage = fight.blockers.reduce(
          (prev, blocker) => prev + blocker.damage,
          0
        );

        if (totalDamage > fight.maxDamage) return true;
      }
    }

    return false;
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

    if (game.currentPhase === "COMBAT_DAMAGE" && !game.declaredAssignDamage) {
      setButtonData({
        style: Style.redButton,
        buttonText: "Assign Damage",
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
    game.declaredAssignDamage,
  ]);

  const defending =
    !game.isActive &&
    game.currentPhase === "COMBAT_BLOCK" &&
    !game.declaredBlockers;

  return (
    <>
      {((game.priority === 1 &&
        (game.currentPhase === "COMBAT_BLOCK"
          ? game.declaredBlockers
          : true)) ||
        defending) && (
        <button
          onClick={handleButtonClick}
          className={Style.phaseButton + " " + buttonData.style}
          disabled={isDisabled()}
        >
          {buttonData.buttonText}
        </button>
      )}

      <div className={Style.passCheckbox}>
        <input
          type="checkbox"
          id="auto-pass"
          name="auto-pass"
          onChange={handleAutoPassCheck}
          checked={turnSkip.autoPassPriority}
        />
        <label>Auto Skip Priority</label>
      </div>
    </>
  );
};
