import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 69165,
  name: "Kalonian Tusker",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 2,
    colorless: 0,
  },
  summoningSickness: true,
  defaultPower: 3,
  defaultToughness: 3,
  typeLine: "Creature — Beast",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
