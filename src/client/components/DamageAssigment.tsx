import Style from "@/css/damage-assign.module.css";
import type { CardState } from "@backend/types/cards";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import { useEffect, useState, type ChangeEvent } from "react";
import { assignDamage } from "@/features/GameSlice";
type DamageAssignmentProps = {
  card: CardState;
};
export const DamageAssignment = ({ card }: DamageAssignmentProps) => {
  const [damage, setDamage] = useState<number | "">(0);
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
    let valueAssigned = isNaN(value) ? 0 : value;
    setDamage(value);
    dipatch(assignDamage({ amount: valueAssigned, id: card.id }));
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
        value={damage}
        onChange={handleDamageAssign}
      />
    </div>
  );
};
