import Style from "@/css/activated.module.css";
import type { ActivatedDataClient, CardState } from "@backend/types/cards";

import useGetTargets from "@/game/hooks/useGetTargets";
import { socketEmit } from "@/features/socket/SocketFactory";

type ActivatedAbilityProps = {
  activatedAbilities: ActivatedDataClient[];
  card: CardState;
};

export const ActivatedAbility = ({
  activatedAbilities,
  card,
}: ActivatedAbilityProps) => {
  const { getTargets } = useGetTargets();

  const activateAbility = async (index: number) => {
    const activatedAbility = activatedAbilities[index];

    if (!activatedAbility.canActivate || !card.cardPlayer) return;

    if (activatedAbility.targets.length > 0) {
      socketEmit({
        name: "cast-spell:action",
        data: { id: card.id, args: {}, type: { name: "SHOWCASE" } },
      });

      const chosenTargets = [];

      for (const targetElement of activatedAbility.targets) {
        const targets = await getTargets({
          targetData: targetElement,
          cardPlayer: card.cardPlayer,
        });

        chosenTargets.push(targets);
      }

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
    <div className={Style.activatedContainer}>
      {activatedAbilities.map((activatedAbility, index) => (
        <button
          key={index}
          onClick={() => activateAbility(index)}
          disabled={!activatedAbility.canActivate}
        >
          {activatedAbility.text}
        </button>
      ))}
    </div>
  );
};
