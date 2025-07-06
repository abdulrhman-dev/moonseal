import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 95424,
  name: "Feral Krushok",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 1,
    colorless: 4,
  },
  summoningSickness: true,
  defaultPower: 5,
  defaultToughness: 4,
  typeLine: "Creature — Beast",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
