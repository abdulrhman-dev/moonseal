import type { RootState } from "@/features/store";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { socketEmit } from "@/features/socket/SocketFactory";
import { useEffect, useState } from "react";

export const PhaseButton = () => {
  const game = useSelector((state: RootState) => state.game);
  const targetsRules = useSelector(
    (state: RootState) => state.targeting.targetsRules,
  );

  const [buttonData, setButtonData] = useState<{
    variant: "default" | "secondary";
    buttonText: string;
  }>(
    game.isActive
      ? { variant: "default", buttonText: "Next" }
      : { variant: "secondary", buttonText: "Pass" },
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
      false,
    );

    if (targetsFullfuiled) return true;

    if (game.currentPhase === "COMBAT_DAMAGE") {
      for (const fight of game.fights) {
        const totalDamage = fight.blockers.reduce(
          (prev, blocker) => prev + blocker.damage,
          0,
        );

        if (totalDamage > fight.maxDamage) return true;
      }
    }

    return false;
  }

  useEffect(() => {
    if (game.currentPhase === "COMBAT_ATTACK" && !game.declaredAttackers) {
      setButtonData({
        variant: "default",
        buttonText: "إعلان المهاجمين",
      });
      return;
    }

    if (game.currentPhase === "COMBAT_BLOCK" && !game.declaredBlockers) {
      setButtonData({
        variant: "secondary",
        buttonText: "إعلان الحواجز",
      });
      return;
    }

    if (game.currentPhase === "COMBAT_DAMAGE" && !game.declaredAssignDamage) {
      setButtonData({
        variant: "default",
        buttonText: "توزيع الضرر",
      });
      return;
    }

    if (game.isActive) {
      setButtonData({
        variant: "default",
        buttonText: "التالي",
      });
    } else {
      setButtonData({
        variant: "secondary",
        buttonText: "مرر",
      });
    }
  }, [
    game.priority,
    game.currentPhase,
    game.declaredAttackers,
    game.declaredBlockers,
    game.declaredAssignDamage,
    game.isActive,
  ]);

  const defending =
    !game.isActive &&
    game.currentPhase === "COMBAT_BLOCK" &&
    !game.declaredBlockers;

  const canClick =
    ((game.priority === 1 &&
      (game.currentPhase === "COMBAT_BLOCK" ? game.declaredBlockers : true)) ||
      defending) &&
    !isDisabled();

  const isNextButton = buttonData.buttonText === "التالي";
  const nextButtonClasses =
    "pointer-events-auto h-14 min-w-44 rounded-full border border-indigo-400/60 bg-indigo-600 px-6 text-base font-semibold text-white shadow-[0_0_28px_rgba(79,70,229,0.55)] shadow-indigo-950/30 ring-1 ring-indigo-400/60 transition-transform hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[0_0_38px_rgba(79,70,229,0.75)]";
  const otherButtonClasses =
    "pointer-events-auto h-14 min-w-44 rounded-full border border-white/10 bg-slate-900/70 px-6 text-base font-semibold text-slate-100 shadow-xl shadow-slate-950/30 backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-slate-900";

  return (
    <div className="pointer-events-none fixed left-6 bottom-6 flex flex-col items-start gap-3">
      {canClick && (
        <Button
          onClick={handleButtonClick}
          variant={isNextButton ? "default" : buttonData.variant}
          size="lg"
          disabled={!canClick}
          className={isNextButton ? nextButtonClasses : otherButtonClasses}
        >
          {buttonData.buttonText}
        </Button>
      )}
    </div>
  );
};
