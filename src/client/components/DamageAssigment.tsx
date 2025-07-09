import Style from "@/css/damage-assign.module.css";
import type { CardState } from "@backend/types/cards";
import type { CardLocations } from "./Card";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import type { ChangeEvent } from "react";
import { assignDamage } from "@/features/GameSlice";
type DamageAssignmentProps = {
  card: CardState;
};
export const DamageAssignment = ({ card }: DamageAssignmentProps) => {
  const dipatch = useDispatch();

  const fight = useSelector((state: RootState) => state.game.fights).find(
    (fight) => fight.blockers.map((blocker) => blocker.id).includes(card.id)
  );

  const currentPhase = useSelector(
    (state: RootState) => state.game.currentPhase
  );

  const isActive = useSelector((state: RootState) => state.game.isActive);

  if (!fight || currentPhase !== "COMBAT_DAMAGE" || !isActive) return <></>;

  const blocker = fight.blockers.find((blocker) => blocker.id === card.id);

  if (!blocker) return <></>;

  function handleDamageAssign(e: ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;

    dipatch(assignDamage({ amount: value, id: card.id }));
  }

  const totalDamage = fight.blockers.reduce(
    (prev, blocker) => prev + blocker.damage,
    0
  );

  return (
    <div className={Style.damageContainer}>
      <input
        className={totalDamage > fight.maxDamage ? Style.invalid : ""}
        type="number"
        min="0"
        value={blocker.damage}
        onChange={handleDamageAssign}
      />
    </div>
  );
};
