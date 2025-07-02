import {
  modifyManaPool,
  tapCard,
  incrementLandUsage,
  type Player,
} from "@/store/PlayersSlice";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { type CardState } from "@/types/cards";

export const spendMana = (
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

  type keyType = keyof typeof card.manaCost;
  const landIds: number[] = [];

  // colored mana handling
  for (const [key, value] of Object.entries(card.manaCost) as [
    keyType,
    number
  ][]) {
    if (key === "colorless" || value === 0) continue;

    let remaining = Math.max(value - manaPool[key], 0);
    manaPool[key] = Math.max(manaPool[key] - value, 0);

    while (remaining) {
      const land = lands.find(
        (land) =>
          land.manaGiven[key] &&
          land.manaGiven[key] > 0 &&
          !landIds.includes(land.id) &&
          !land.tapped
      );

      if (!land || !land.manaGiven[key]) throw Error("spendMana failed");

      landIds.push(land.id);
      dispatch(tapCard(land.id));

      remaining -= land.manaGiven[key];
    }
  }

  let colorless: number = card.manaCost["colorless"]
    ? card.manaCost["colorless"]
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
