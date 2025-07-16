import type { RootState } from "@/features/store";
import { CardObjectsContext } from "@/game/providers/CardObjectsProvider";
import { use } from "react";
import { useSelector } from "react-redux";
import DirectTargetArrow from "./DirectTargetArrow";
import * as THREE from "three";
import { targetsFulfilled } from "@/game/hooks/useGetTargets";
import TargetArrow from "./TargetArrow";

const TargetLinesHandler = () => {
  const fights = useSelector((state: RootState) => state.game.fights);
  const targeting = useSelector((state: RootState) => state.targeting);
  const stack = useSelector((state: RootState) => state.game.spellStack);

  const { objects } = use(CardObjectsContext);

  function getAskingBlocker() {
    if (!targeting.askingCard) return new THREE.Vector3();

    const pos = new THREE.Vector3();
    objects.get(targeting.askingCard.id)?.parent?.getWorldPosition(pos);

    return pos;
  }

  function getStackTop() {
    return stack[stack.length - 1];
  }

  return (
    <group>
      {fights.map((fight) =>
        fight.blockers.map((blocker) => {
          const blockerPos = new THREE.Vector3();
          objects.get(blocker.id)?.parent?.getWorldPosition(blockerPos);

          const attackerPos = new THREE.Vector3();
          objects.get(fight.attacker)?.parent?.getWorldPosition(attackerPos);

          return (
            <DirectTargetArrow startPos={blockerPos} endPos={attackerPos} />
          );
        })
      )}

      {stack.length &&
        getStackTop().targets.map((target) => {
          const targetPos = new THREE.Vector3();
          objects.get(target)?.parent?.getWorldPosition(targetPos);

          return (
            <TargetArrow
              startPos={new THREE.Vector3(-5.23, 2.45, 3.2)}
              endPos={targetPos}
            />
          );
        })}

      {targeting.targetsRules.find(
        (targetRule) => targetRule.isAttacker && targetRule.amount > 0
      ) && (
        <DirectTargetArrow
          startPos={getAskingBlocker()}
          mouseEnd={true}
          mouseEndZ={getAskingBlocker().z}
        />
      )}

      {stack.length &&
        getStackTop().type === "SHOWCASE" &&
        !targetsFulfilled(targeting) && (
          <TargetArrow
            startPos={new THREE.Vector3(-5.23, 2.45, 3.2)}
            mouseEnd={true}
            mouseEndZ={2}
          />
        )}
    </group>
  );
};

export default TargetLinesHandler;
