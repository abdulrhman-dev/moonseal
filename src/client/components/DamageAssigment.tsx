import { Input } from "@/components/ui/input";
import type { RootState } from "@/features/store";
import { assignDamage } from "@/features/GameSlice";
import type { CardState } from "@backend/types/cards";
import { useDispatch, useSelector } from "react-redux";
import { useState, type ChangeEvent } from "react";

type DamageAssignmentProps = {
  card: CardState;
};

export const DamageAssignment = ({ card }: DamageAssignmentProps) => {
  const [damage, setDamage] = useState<number | "">(0);
  const dipatch = useDispatch();

  const fight = useSelector((state: RootState) => state.game.fights).find(
    (fight) => fight.blockers.map((blocker) => blocker.id).includes(card.id),
  );

  const currentPhase = useSelector(
    (state: RootState) => state.game.currentPhase,
  );

  const isActive = useSelector((state: RootState) => state.game.isActive);

  if (!fight || currentPhase !== "COMBAT_DAMAGE" || !isActive) return <></>;

  const blocker = fight.blockers.find((blocker) => blocker.id === card.id);

  if (!blocker) return <></>;

  function handleDamageAssign(e: ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value);
    const valueAssigned = isNaN(value) ? 0 : value;
    setDamage(value);
    dipatch(assignDamage({ amount: valueAssigned, id: card.id }));
  }

  const totalDamage = fight.blockers.reduce(
    (prev, blocker) => prev + blocker.damage,
    0,
  );

  const invalid = totalDamage > fight.maxDamage;

  return (
    <div className="pointer-events-auto flex h-(--card-height) w-(--card-width) items-center justify-center rounded-2xl border border-indigo-300/25 bg-indigo-950/55 shadow-[0_18px_34px_rgba(12,10,35,0.52)] backdrop-blur-xl">
      <Input
        className="h-11 w-20 rounded-full border-indigo-200/30 bg-indigo-50/92 text-center text-lg font-semibold text-indigo-950 tabular-nums shadow-inner shadow-indigo-200/35"
        type="number"
        min="0"
        value={damage}
        aria-invalid={invalid}
        onChange={handleDamageAssign}
      />
    </div>
  );
};
