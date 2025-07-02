import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 136697,
  name: "Harrier Naga",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 1,
    colorless: 2,
  },
  summoningSickness: true,
  defaultPower: 3,
  defaultToughness: 3,
  typeLine: "Creature — Snake Warrior",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
