import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 230897,
  name: "Grizzled Outrider",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 1,
    colorless: 4,
  },
  summoningSickness: true,
  defaultPower: 5,
  defaultToughness: 5,
  typeLine: "Creature — Elf Warrior",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
