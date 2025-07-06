import Style from "@/css/activated.module.css";
import type { ActivatedData, CardState } from "@backend/types/cards";
import {
  castSpell,
  removeShowcase,
  showcaseOnStack,
  tapCard,
  type Player,
} from "@/store/PlayersSlice";
import { checkMana, spendMana } from "@/game/logic/manaLogic";
import { useDispatch } from "react-redux";
import useGetTargets from "@/game/hooks/useGetTargets";

type ActivatedAbilityProps = {
  activatedAbilities: ActivatedData[];
  player: Player;
  card: CardState;
};

export const ActivatedAbility = ({
  activatedAbilities,
  player,
  card,
}: ActivatedAbilityProps) => {
  const { getTargets } = useGetTargets();
  const dispatch = useDispatch();
  const checkCost = (index: number) => {
    return (
      checkMana(player, activatedAbilities[index].cost.mana) &&
      (activatedAbilities[index].cost.tap ? !card.tapped : true)
    );
  };

  const activateAbility = async (index: number) => {
    if (!checkCost(index) || !card.cardPlayer) return;
    const activatedAbility = activatedAbilities[index];

    // pay ability cost
    spendMana(activatedAbility.cost.mana, player, dispatch);

    if (activatedAbility.cost.tap) dispatch(tapCard(card.id));

    // handle targets
    if (activatedAbility.targets.length > 0) {
      const chosenTargets = [];
      for (const targetData of activatedAbility.targets) {
        dispatch(
          showcaseOnStack({
            card,
            castedPlayer: card.cardPlayer,
            args: {},
            type: "SHOWCASE",
          })
        );

        const targets = await getTargets({
          cardPlayer: card.cardPlayer,
          targetData,
        });

        if (!targets) continue;

        // activate ability by pushing it to stack
        chosenTargets.push(targets);
        dispatch(removeShowcase());
      }

      dispatch(
        castSpell({
          card,
          castedPlayer: card.cardPlayer,
          args: { targets: chosenTargets, cardPlayer: card.cardPlayer },
          type: ["ACTIVATED", index],
        })
      );
      return;
    }

    // activate ability by pushing it to stack
    dispatch(
      castSpell({
        card,
        castedPlayer: card.cardPlayer,
        args: { cardPlayer: card.cardPlayer },
        type: ["ACTIVATED", index],
      })
    );
  };

  return (
    <div className={Style.activatedContainer}>
      {activatedAbilities.map((activatedAbility, index) => (
        <button
          key={index}
          onClick={() => activateAbility(index)}
          disabled={!checkCost(index)}
        >
          {activatedAbility.text}
        </button>
      ))}
    </div>
  );
};
