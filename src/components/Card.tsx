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
} from "@/store/PlayersSlice";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

// types
import { type CardState } from "@/types/cards";

import Style from "@/css/card.module.css";

interface CardProps {
  card: CardState;
  location: "hand" | "battlefield";
  style?: React.CSSProperties | undefined;
  cardPlayer: 1 | 2;
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

function Card({ card, location, style, cardPlayer }: CardProps) {
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
  const attackers = useSelector((state: RootState) => state.players.attackers);

  const { image } = useImage(card.game_id.toString());
  const canCast = useCanCast(card, cardPlayer);
  const dispatch = useDispatch();

  const handleCardClick = () => {
    if (location === "battlefield") {
      if (currPhase === "COMBAT_ATTACK" && cardPlayer === activePLayer) {
        dispatch(toggleAttacker(card.id));
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
      className={`
        ${Style.card} 
        ${location === "hand" ? Style.inhand : Style.inbattlefield} ${
        canCast && location === "hand" ? Style.canCast : ""
      }
        ${card.tapped ? Style.tapped : ""}
        ${attackers.includes(card.id) ? Style.attacking : ""}
      `}
      style={{ ...style, backgroundImage: `url(${image})` }}
      onClick={handleCardClick}
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
