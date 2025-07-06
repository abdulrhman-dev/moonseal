import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 168484,
  name: "Gigantosaurus",
  type: "creature",
  canTap: false,
  manaCost: {
    green: 5,
    colorless: 0,
  },
  summoningSickness: true,
  defaultPower: 10,
  defaultToughness: 10,
  typeLine: "Creature — Dinosaur",
  text: "",
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
