import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 1439,
  name: "Grizzly Bears",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 1,
    colorless: 1,
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
