import { Button } from "@/components/ui/button";
import type { ActivatedDataClient, CardState } from "@backend/types/cards";

import useGetTargets from "@/game/hooks/useGetTargets";
import { socketEmit } from "@/features/socket/SocketFactory";
import { useState } from "react";

type ActivatedAbilityProps = {
  activatedAbilities: ActivatedDataClient[];
  card: CardState;
};

export const ActivatedAbility = ({
  activatedAbilities,
  card,
}: ActivatedAbilityProps) => {
  const { getTargets } = useGetTargets();
  const [isChoosingTargets, setIsChoosingTargets] = useState(false);

  const activateAbility = async (index: number) => {
    const activatedAbility = activatedAbilities[index];

    if (!activatedAbility.canActivate || !card.cardPlayer) return;

    if (activatedAbility.targets.length > 0) {
      setIsChoosingTargets(true);
      socketEmit({
        name: "cast-spell:action",
        data: { id: card.id, args: {}, type: { name: "SHOWCASE" } },
      });

      const chosenTargets = [];

      for (const targetElement of activatedAbility.targets) {
        const targets = await getTargets({
          targetData: targetElement,
          card,
          location: "battlefield",
        });

        chosenTargets.push(targets);
      }
      setIsChoosingTargets(false);
      socketEmit({
        name: "cast-spell:action",
        data: {
          type: {
            name: "ACTIVITED",
            activitedNum: index,
          },
          args: { targets: chosenTargets },
          id: card.id,
        },
      });
    } else {
      socketEmit({
        name: "cast-spell:action",
        data: {
          type: {
            name: "ACTIVITED",
            activitedNum: index,
          },
          args: {},
          id: card.id,
        },
      });
    }
  };

  return (
    <div className="pointer-events-auto flex max-w-60 flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-2 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
      {activatedAbilities.map((activatedAbility, index) => (
        <Button
          key={index}
          onClick={() => activateAbility(index)}
          disabled={!activatedAbility.canActivate || isChoosingTargets}
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-white/10 bg-white/5 px-3 text-[0.68rem] text-slate-100 hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          {activatedAbility.text}
        </Button>
      ))}
    </div>
  );
};
