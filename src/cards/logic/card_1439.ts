import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  game_id: 1439,
  name: "Grizzly Bears",
  type: "creature",
  canTap: false,
  mana_cost: {
    green: 1,
    colorless: 1,
  },
  type_line: "Creature — Bear",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
