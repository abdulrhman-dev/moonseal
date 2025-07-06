import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 559542,
  type: "land",
  name: "Forest",
  typeLine: "Basic Land — Forest",
  text: "({T}: Add {G}.)",
  canTap: true,
  manaGiven: {
    green: 1,
  },
  valid() {
    return true;
  },
};

export default card;
