import type { RootState } from "@/store/store";
import {
  clearTargets,
  initilizeTargets,
  type TargetingState,
} from "@/store/TargetingSlice";
import type { CardState, TargetData, TargetSelectGroup } from "@/types/cards";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type GetTargetCallback = (targets: CardState[]) => void;

const targetsFulfilled = (targeting: TargetingState): boolean => {
  if (targeting.type === "AND") {
    return targeting.targetsRules.reduce(
      (prev, targetRule) => targetRule.amount === 0 && prev,
      true
    );
  }

  return (
    targeting.targetsRules.find((targetRule) => targetRule.amount === 0) !==
    undefined
  );
};

function useGetTargets() {
  const [callback, setCallback] = useState<GetTargetCallback | null>(null);
  const dispatch = useDispatch();
  const targeting = useSelector((state: RootState) => state.targeting);

  const getTargets = useCallback(
    ({
      cardPlayer,
      targetData,
    }: {
      cardPlayer: 1 | 2;
      targetData: TargetData;
    }) => {
      const targetSelects = targetData.targetSelects.map((targetRule) =>
        targetRule.player === 0
          ? targetRule
          : {
              ...targetRule,
              player:
                targetRule.player === 1
                  ? cardPlayer
                  : ((cardPlayer ^ 3) as 1 | 2),
            }
      ) as TargetSelectGroup;

      dispatch(initilizeTargets({ ...targetData, targetSelects }));

      return new Promise<CardState[]>((resolve) => {
        setCallback(() => resolve);
      });
    },
    []
  );

  useEffect(() => {
    if (targeting.targetsRules.length > 0 && targetsFulfilled(targeting)) {
      if (callback) {
        callback(targeting.targets.map((target) => target.data));
        setCallback(null);
      }
      dispatch(clearTargets());
    }
  }, [callback, targeting, dispatch]);

  return { getTargets };
}

export default useGetTargets;
