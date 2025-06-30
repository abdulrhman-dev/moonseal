import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  game_id: 559542,
  type: "land",
  name: "Forest",
  type_line: "Basic Land — Forest",
  text: "({T}: Add {G}.)",
  can_tap: true,
  mana_given: {
    green: 1,
  },
  valid() {
    return true;
  },
};

export default card;
