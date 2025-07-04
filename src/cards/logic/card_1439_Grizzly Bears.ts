import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 1439,
  name: "Grizzly Bears",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 0,
    colorless: 0,
  },
  summoningSickness: true,
  defaultPower: 2,
  defaultToughness: 2,
  typeLine: "Creature — Bear",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
