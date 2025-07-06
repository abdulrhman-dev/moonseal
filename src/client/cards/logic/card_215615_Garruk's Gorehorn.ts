import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 215615,
  name: "Garruk's Gorehorn",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 1,
    colorless: 4,
  },
  summoningSickness: true,
  defaultPower: 7,
  defaultToughness: 3,
  typeLine: "Creature — Beast",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
