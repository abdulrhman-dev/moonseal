import { modifyManaPool, tapCard, type Player } from "@/store/PlayersSlice";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { ManaDefault, type Mana } from "@backend/types/cards";

export const spendMana = (
  manaCost: Mana,
  player: Player,
  dispatch: Dispatch<UnknownAction>
) => {
  const manaPool = { ...player.mana };
  const lands = [...player.battlefield.lands];

  type keyType = keyof typeof manaCost;
  const landIds: number[] = [];

  // colored mana handling
  for (const [key, value] of Object.entries(manaCost) as [keyType, number][]) {
    if (key === "colorless" || value === 0) continue;

    let remaining = Math.max(value - manaPool[key], 0);
    manaPool[key] = Math.max(manaPool[key] - value, 0);

    while (remaining > 0) {
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

      if (remaining < 0) {
        manaPool[key] -= remaining;
        remaining = 0;
      }
    }
  }

  let colorless: number = manaCost["colorless"] ? manaCost["colorless"] : 0;

  for (const [key, value] of Object.entries(manaPool) as [keyType, number][]) {
    if (value === 0) continue;
    if (colorless === 0) break;

    const colorlessTemp = colorless;

    colorless = Math.max(colorless - manaPool[key], 0);
    manaPool[key] = Math.max(manaPool[key] - colorlessTemp, 0);
  }
  if (colorless > 0) {
    for (const land of lands) {
      if (landIds.includes(land.id) || land.tapped) continue;
      if (colorless === 0) break;

      dispatch(tapCard(land.id));

      colorless--;
    }

    if (colorless > 0) throw Error("spendMana failed");
  }

  dispatch(modifyManaPool(manaPool));
};

export const checkMana = (player: Player, manaCost: Mana) => {
  // Getting all avaliable mana
  const mana: Required<Mana> = {
    ...ManaDefault,
    ...player.mana,
  };

  type ManaKeyValue = [keyof Mana, number];

  for (const land of player.battlefield.lands) {
    if (land.tapped === true) continue;

    for (const [key, value] of Object.entries(
      land.manaGiven
    ) as ManaKeyValue[]) {
      mana[key] += value;
    }
  }

  // Removing appropriate mana
  for (const [key, value] of Object.entries(manaCost) as ManaKeyValue[]) {
    if (key === "colorless") continue;

    mana[key] -= value;

    if (mana[key] < 0) return false;
  }

  const remaningMana = Object.values(mana).reduce(
    (prev, curr) => prev + curr,
    0
  );

  if (manaCost.colorless && manaCost.colorless <= remaningMana) return true;

  return !manaCost.colorless;
};
