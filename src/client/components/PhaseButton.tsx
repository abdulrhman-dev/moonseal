import type { RootState } from "@/features/store";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
      ? { variant: "default", buttonText: "التالي" }
      : { variant: "secondary", buttonText: "تمرير" },
  );

  const [turnSkip, setTurnSkip] = useState({
    autoPassPriority: false,
    autoResolvePriority: false,
  });

  const handleAutoSkip = () => {
    const newTurnSkip = {
      ...turnSkip,
      autoPassPriority: !turnSkip.autoPassPriority,
    };

    socketEmit({
      name: "turn-skip:action",
      data: newTurnSkip,
    });
    setTurnSkip(newTurnSkip);
  };

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
        buttonText: "تمرير",
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
    "pointer-events-auto h-14 min-w-44 rounded-full border border-indigo-200/45 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 px-6 text-base font-semibold text-indigo-50 shadow-[0_0_30px_rgba(114,93,255,0.52)] ring-1 ring-indigo-200/55 transition-transform hover:-translate-y-0.5 hover:brightness-110";
  const otherButtonClasses =
    "pointer-events-auto h-14 min-w-44 rounded-full border border-indigo-200/20 bg-indigo-950/70 px-6 text-base font-semibold text-indigo-50 shadow-[0_14px_28px_rgba(9,8,24,0.45)] backdrop-blur transition-transform hover:-translate-y-0.5 hover:border-indigo-200/45 hover:bg-indigo-900/72";

  return (
    <div
      className="pointer-events-none fixed left-6 bottom-6 flex flex-col items-start gap-3"
      dir="rtl"
    >
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

      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-sm font-medium tracking-[0.08em] text-slate-100 shadow-lg shadow-slate-950/30 backdrop-blur-xl">
        <Checkbox
          id="auto-skip"
          name="auto-skip"
          checked={turnSkip.autoPassPriority}
          onCheckedChange={handleAutoSkip}
          className="size-5 rounded-md border border-white/15 bg-white/5 text-cyan-200 shadow-inner shadow-black/20 transition-colors data-[state=checked]:border-cyan-300 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-300/50"
        />
        <label
          htmlFor="auto-skip"
          className="cursor-pointer select-none text-slate-100/90"
        >
          تخطى الأولوية تلقائيًا
        </label>
      </div>
    </div>
  );
};
