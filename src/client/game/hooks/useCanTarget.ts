import type { CardState } from "@backend/types/cards";
import type { RootState } from "@/features/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { CardLocations } from "@/components/Card";

function useCanTarget(
  card: CardState,
  location: CardLocations,
  cardPlayer: 0 | 1 | 2
): boolean {
  const [canTarget, setCanTarget] = useState(false);
  const targetsRules = useSelector(
    (state: RootState) => state.targeting.targetsRules
  );
  const selectedRules = useSelector(
    (state: RootState) => state.targeting.selectedRules
  );
  const targets = useSelector((state: RootState) => state.targeting.targets);
  const targetingType = useSelector((state: RootState) => state.targeting.type);
  const attackers = useSelector((state: RootState) => state.game.fights).map(
    (fight) => fight.attacker
  );
  useEffect(() => {
    if (targetsRules.length === 0 || !cardPlayer) {
      setCanTarget(false);
      return;
    }

    if (targets.find((target) => target.data.id === card.id)) {
      setCanTarget(false);
      return;
    }
    const isAttacker = attackers.includes(card.id);

    const target = targetsRules.findIndex(
      (targetRule) =>
        targetRule.amount > 0 &&
        (targetRule.type === "all" || targetRule.type === card.type) &&
        (targetRule.location === "all" || targetRule.location === location) &&
        (targetRule.player === 0 || targetRule.player === cardPlayer) &&
        (targetRule.isAttacker ? isAttacker : true) &&
        (targetRule.isTapped ? card.tapped : true)
    );

    if (targetingType === "AND") {
      setCanTarget(target !== -1);
    } else {
      const selectedRule = selectedRules.findIndex(
        (selectRule) => selectRule === true
      );
      if (location === "lookup") {
        console.log("---------------LOOK UP---------------");
        console.log("HELLO BRO", target);
        console.log(
          "CAN TARGET:",
          (target !== -1 && selectedRule === -1) ||
            (selectedRule !== -1 && selectedRule === target)
        );
        console.log("---------------LOOK UP---------------");
      }

      setCanTarget(
        (target !== -1 && selectedRule === -1) ||
          (selectedRule !== -1 && selectedRule === target)
      );
    }
  }, [targetsRules, selectedRules, targetingType]);

  return canTarget;
}

export default useCanTarget;
