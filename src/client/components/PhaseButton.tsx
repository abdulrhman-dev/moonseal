import type { RootState } from "@/features/store";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { socketEmit } from "@/features/socket/SocketFactory";
import { useEffect, useState } from "react";

export const PhaseButton = () => {
  const [turnSkip, setTurnSkip] = useState({
    autoPassPriority: false,
    autoResolvePriority: false,
  });

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

  const handleAutoPassCheck = (checked: boolean) => {
    const newTurnSkip = {
      ...turnSkip,
      autoPassPriority: checked,
    };

    socketEmit({ name: "turn-skip:action", data: newTurnSkip });
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
        buttonText: "Declare Attackers",
      });
      return;
    }

    if (game.currentPhase === "COMBAT_BLOCK" && !game.declaredBlockers) {
      setButtonData({
        variant: "secondary",
        buttonText: "Declare Blockers",
      });
      return;
    }

    if (game.currentPhase === "COMBAT_DAMAGE" && !game.declaredAssignDamage) {
      setButtonData({
        variant: "default",
        buttonText: "Assign Damage",
      });
      return;
    }

    if (game.isActive) {
      setButtonData({
        variant: "default",
        buttonText: "Next",
      });
    } else {
      setButtonData({
        variant: "secondary",
        buttonText: "Pass",
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

  return (
    <div className="bg-red-500 w-50 h-50 bottom-5 right-6 ">
      {((game.priority === 1 &&
        (game.currentPhase === "COMBAT_BLOCK"
          ? game.declaredBlockers
          : true)) ||
        defending) && (
        <Button
          onClick={handleButtonClick}
          variant={buttonData.variant}
          size="lg"
          disabled={isDisabled()}
          className="h-14 min-w-44 rounded-full border border-white/10 bg-primary px-6 text-base font-semibold shadow-xl shadow-indigo-950/20 backdrop-blur transition-transform hover:-translate-y-0.5"
        >
          {buttonData.buttonText}
        </Button>
      )}

      <div className="pointer-events-auto fixed flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
        <Checkbox
          id="auto-pass"
          checked={turnSkip.autoPassPriority}
          onCheckedChange={(checked) => handleAutoPassCheck(checked === true)}
          className="border-white/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        />
        <Label htmlFor="auto-pass" className="cursor-pointer text-sm">
          Auto Skip Priority
        </Label>
      </div>
    </div>
  );
};
