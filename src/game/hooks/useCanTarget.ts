import type { CardState } from "@/types/cards";
import type { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function useCanTarget(card: CardState, cardPlayer: 1 | 2): boolean {
  const [canTarget, setCanTarget] = useState(false);
  const targetsRules = useSelector(
    (state: RootState) => state.targeting.targetsRules
  );

  useEffect(() => {
    if (targetsRules.length === 0) return;

    const searchIndexStrict = targetsRules.findIndex(
      (targetRule) =>
        targetRule.type === card.type &&
        targetRule.player === cardPlayer &&
        targetRule.amount > 0
    );

    const searchIndexLoose = targetsRules.findIndex(
      (targetRule) =>
        targetRule.type === card.type &&
        targetRule.player === cardPlayer &&
        targetRule.amount > 0
    );

    if (searchIndexStrict !== -1 || searchIndexLoose !== -1) {
      setCanTarget(true);
    } else {
      setCanTarget(false);
    }
  }, [targetsRules]);

  return canTarget;
}

export default useCanTarget;
