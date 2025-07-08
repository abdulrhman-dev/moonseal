import Mana from "../classes/Mana";
import { Card } from "../classes/Card";

class CardCreator extends Card {
  cast() {}

  resolve(): void {}
}

export default function () {
  const card = new CardCreator({
    gameId: 136697,
    name: "Harrier Naga",
    type: "creature",
    typeLine: "Creature — Snake Warrior",
    text: "",
    summoningSickness: true,
    defaultPower: 3,
    defaultToughness: 3,
    manaCost: new Mana({
      green: 1,
      colorless: 2,
    }),
    keywords: [],
  });

  return card;
}
