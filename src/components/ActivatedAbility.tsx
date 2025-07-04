import React from "react";

import Style from "@/css/activated.module.css";
import type { ActivatedData, Card, CardState } from "@/types/cards";
import { tapCard, type Player } from "@/store/PlayersSlice";
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
    console.log(checkMana(player, activatedAbilities[index].cost.mana));
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

    const cardImport = await import(
      `../cards/logic/card_${card.gameId}_${card.name}`
    );
    const fulllCard = cardImport.default as Card;

    if (activatedAbility.targets.length > 0) {
      for (const targetData of activatedAbility.targets) {
        const targets = await getTargets({
          cardPlayer: card.cardPlayer,
          targetData,
        });

        if (!targets) continue;

        fulllCard.activatedActions[index]({
          cardPlayer: card.cardPlayer,
          targets,
        });
      }

      return;
    }

    // activate ability
    fulllCard.activatedActions[index]({ cardPlayer: card.cardPlayer });
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
