import type { CardState } from "@/types/cards";
import type { RootState } from "@/store/store";
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
  const targets = useSelector((state: RootState) => state.targeting.targets);

  useEffect(() => {
    if (!cardPlayer) return;
    if (targetsRules.length === 0) return;

    if (targets.find((target) => target.data.id === card.id)) {
      setCanTarget(false);
      return;
    }

    const rules: number[] = [];

    rules.push(
      targetsRules.findIndex(
        (targetRule) =>
          targetRule.type === card.type &&
          targetRule.player === cardPlayer &&
          targetRule.amount > 0
      )
    );

    rules.push(
      targetsRules.findIndex(
        (targetRule) =>
          targetRule.type === card.type &&
          targetRule.player === 0 &&
          targetRule.amount > 0
      )
    );

    rules.push(
      targetsRules.findIndex(
        (targetRule) =>
          targetRule.type === location &&
          targetRule.player === cardPlayer &&
          targetRule.amount > 0
      )
    );

    if (rules.findIndex((rule) => rule !== -1) !== -1) {
      setCanTarget(true);
    } else {
      setCanTarget(false);
    }
  }, [targetsRules]);

  return canTarget;
}

export default useCanTarget;
