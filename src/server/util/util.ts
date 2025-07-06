import type { CardState } from "@backend/types/cards";

export const emptyCardList = (size: number): CardState[] => {
  return Array(size).fill({
    id: 0,
    type: "instant",
    name: "",
    enchanters: [],
    targets: [],
    targetData: [],
    summoningSickness: false,
    power: 0,
    toughness: 0,
    cardPlayer: 2,
    gameId: 0,
    tapped: 0,
    text: "",
    typeLine: "",
  });
};
