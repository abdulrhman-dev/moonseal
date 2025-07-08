import Mana from "../classes/Mana";
import { Card } from "../classes/Card";
class CardCreator extends Card {
  cast() {}

  resolve(): void {}
}

export default function () {
  const card = new CardCreator({
    gameId: 1439,
    name: "Grizzly Bears",
    type: "creature",
    typeLine: "Creature — Bear",
    text: "",
    summoningSickness: false,
    defaultPower: 2,
    defaultToughness: 2,
    manaCost: new Mana({
      green: 1,
      colorless: 1,
    }),
    keywords: [],
  });

  return card;
}
