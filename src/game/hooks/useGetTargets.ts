import type { RootState } from "@/store/store";
import { clearTargets, initilizeTargets } from "@/store/TargetingSlice";
import type { TargetSelect } from "@/types/cards";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type GetTargetCallback = (targets: number[]) => void;

const targetsFulfilled = (targetsRules: TargetSelect[]): boolean => {
  return targetsRules.reduce(
    (prev, targetRule) => targetRule.amount === 0 && prev,
    true
  );
};

function useGetTargets() {
  const [callback, setCallback] = useState<GetTargetCallback | null>(null);
  const dispatch = useDispatch();
  const targeting = useSelector((state: RootState) => state.targeting);

  function getTargets(targetRules: TargetSelect[], cb: GetTargetCallback) {
    dispatch(initilizeTargets(targetRules));
    setCallback(() => cb);
  }

  useEffect(() => {
    if (
      targeting.targetsRules.length > 0 &&
      targetsFulfilled(targeting.targetsRules)
    ) {
      if (callback) {
        callback(targeting.targets.map((target) => target.id));
        setCallback(null);
      }
      dispatch(clearTargets());
    }
  }, [callback, targeting, dispatch]);

  return { getTargets };
}

export default useGetTargets;
