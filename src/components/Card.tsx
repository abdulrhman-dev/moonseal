// custom hooks
import useImage from "@/cards/util/image";
import useCanCast from "@/game/hooks/useCanCast";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  modifyManaPool,
  tapCard,
  incrementLandUsage,
  type Player,
  addToBattleField,
  toggleAttacker,
  toggleBlocker,
} from "@/store/PlayersSlice";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

// types
import { type CardState, type TargetSelect } from "@/types/cards";

import Style from "@/css/card.module.css";
import useGetTargets from "@/game/hooks/useGetTargets";
import { addTarget, removeTarget } from "@/store/TargetingSlice";
import useCanTarget from "@/game/hooks/useCanTarget";
import type { AddRefFunction } from "@/App";

interface CardProps {
  card: CardState;
  location: "hand" | "battlefield";
  style?: React.CSSProperties | undefined;
  cardPlayer: 1 | 2;
  addRef: AddRefFunction;
}

const spendMana = (
  card: CardState,
  player: Player,
  dispatch: Dispatch<UnknownAction>
) => {
  if (card.type === "land") {
    dispatch(incrementLandUsage());
    return;
  }

  const manaPool = { ...player.mana };
  const lands = [...player.battlefield.lands];

  type keyType = keyof typeof card.mana_cost;
  const landIds: number[] = [];

  // colored mana handling
  for (const [key, value] of Object.entries(card.mana_cost) as [
    keyType,
    number
  ][]) {
    if (key === "colorless" || value === 0) continue;

    let remaining = Math.max(value - manaPool[key], 0);
    manaPool[key] = Math.max(manaPool[key] - value, 0);

    while (remaining) {
      const land = lands.find(
        (land) =>
          land.mana_given[key] &&
          land.mana_given[key] > 0 &&
          !landIds.includes(land.id) &&
          !land.tapped
      );

      if (!land || !land.mana_given[key]) throw Error("spendMana failed");

      landIds.push(land.id);
      dispatch(tapCard(land.id));

      remaining -= land.mana_given[key];
    }
  }

  let colorless: number = card.mana_cost["colorless"]
    ? card.mana_cost["colorless"]
    : 0;

  for (const [key, value] of Object.entries(manaPool) as [keyType, number][]) {
    if (value === 0) continue;
    if (colorless === 0) break;

    colorless -= Math.max(colorless - manaPool[key], 0);
    manaPool[key] = Math.max(manaPool[key] - colorless, 0);
  }
  if (colorless > 0) {
    for (const land of lands) {
      if (landIds.includes(land.id) || land.tapped) continue;
      if (colorless === 0) break;

      dispatch(tapCard(land.id));

      colorless--;
    }
  }

  dispatch(modifyManaPool(manaPool));
};

function Card({ card, location, style, cardPlayer, addRef }: CardProps) {
  // redux state
  const player = useSelector(
    (state: RootState) => state.players.player[cardPlayer - 1]
  );
  const currPhase = useSelector(
    (state: RootState) => state.players.current_phase
  );
  const activePLayer = useSelector(
    (state: RootState) => state.players.current_player
  );
  const targeting = useSelector((state: RootState) => state.targeting);
  const attackers = useSelector((state: RootState) => state.players.attackers);
  const dispatch = useDispatch();

  const { image } = useImage(card.game_id.toString());
  const { getTargets } = useGetTargets();
  const canCast = useCanCast(card, cardPlayer);
  const canTarget = useCanTarget(card, cardPlayer);

  const handleCardClick = () => {
    if (location === "battlefield") {
      if (canTarget) {
        if (targeting.targets.find((target) => target.id === card.id)) {
          dispatch(removeTarget(card.id));
        } else {
          dispatch(
            addTarget({ id: card.id, type: card.type, player: cardPlayer })
          );
        }
      }

      if (currPhase === "COMBAT_ATTACK" && cardPlayer === activePLayer) {
        dispatch(toggleAttacker(card.id));
      }

      if (currPhase === "COMBAT_BLOCK" && cardPlayer !== activePLayer) {
        const targetRule: TargetSelect[] = [
          {
            type: "creature",
            amount: 1,
            player: activePLayer,
          },
        ];

        const callback = (targets: number[]) => {
          if (targets.length !== 1) return;

          if (!attackers.includes(targets[0])) {
            getTargets(targetRule, callback);
            return;
          }

          dispatch(toggleBlocker({ id: card.id, target: targets[0] }));
        };

        getTargets(targetRule, callback);
      }
    } else if (location === "hand") {
      if (currPhase !== "MAIN_PHASE_1" && currPhase !== "MAIN_PHASE_2") return;

      if (!canCast) return;

      spendMana(card, player, dispatch);

      dispatch(addToBattleField(card));
    }
  };

  return (
    <div
      className={`${Style.card} ${
        location === "hand" ? Style.inhand : Style.inbattlefield
      } ${canCast && location === "hand" ? Style.canCast : ""} ${
        card.tapped ? Style.tapped : ""
      } ${attackers.includes(card.id) ? Style.attacking : ""} ${
        location === "battlefield" && canTarget ? Style.targetable : ""
      }`}
      style={{
        ...style,
        backgroundImage: `url(${image})`,
        transformOrigin: cardPlayer === 1 ? "bottom" : "top",
      }}
      onClick={handleCardClick}
      ref={(node) => {
        if (node) addRef(node, card.id);
      }}
    >
      {card.type === "creature" && (
        <div className={Style.cardPlate}>
          <p>
            {card.power}/{card.toughness}
          </p>
        </div>
      )}
    </div>
  );
}

export default Card;
