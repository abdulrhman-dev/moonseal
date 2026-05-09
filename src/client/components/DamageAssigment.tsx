import { Input } from "@/components/ui/input";
import type { RootState } from "@/features/store";
import { assignDamage } from "@/features/GameSlice";
import type { CardState } from "@backend/types/cards";
import { useDispatch, useSelector } from "react-redux";
import { type ChangeEvent } from "react";

type DamageAssignmentProps = {
  card: CardState;
};

export const DamageAssignment = ({ card }: DamageAssignmentProps) => {
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
    dipatch(assignDamage({ amount: valueAssigned, id: card.id }));
  }

  const totalDamage = fight.blockers.reduce(
    (prev, blocker) => prev + blocker.damage,
    0,
  );

  const invalid = totalDamage > fight.maxDamage;

  return (
    <div className="pointer-events-auto absolute left-1/2 top-1/2 flex w-[calc(var(--card-width)*0.78)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-indigo-300/25 bg-indigo-950/68 px-3 py-3 shadow-[0_18px_34px_rgba(12,10,35,0.52)] backdrop-blur-xl">
      <div className="flex flex-col items-center gap-2">
        <span className="text-[0.68rem] uppercase tracking-[0.24em] text-indigo-100/75">
          توزيع الضرر
        </span>
        <Input
          className="h-12 w-24 rounded-full border-indigo-200/30 bg-indigo-50/92 text-center text-lg font-semibold text-white tabular-nums shadow-inner shadow-indigo-200/35 placeholder:text-white/60"
          type="number"
          min="0"
          value={blocker.damage}
          aria-invalid={invalid}
          onChange={handleDamageAssign}
        />
      </div>
    </div>
  );
};
