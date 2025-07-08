import { targetsFulfilled } from "@/game/hooks/useGetTargets";
import { startAppListening } from "../store";
import { addTarget, clearTargets } from "../TargetingSlice";
import { socketEmit } from "../socket/SocketFactory";

export default function setupTargetingListner() {
  startAppListening({
    actionCreator: addTarget,
    effect: async (action, api) => {
      const targeting = api.getState().targeting;
      if (
        targeting.targetsRules.length > 0 &&
        targeting.mode === "auto" &&
        targetsFulfilled(targeting)
      ) {
        socketEmit({
          name: "send-targets:action",
          data: targeting.targets,
        });
        api.dispatch(clearTargets());
      }
    },
  });
}
