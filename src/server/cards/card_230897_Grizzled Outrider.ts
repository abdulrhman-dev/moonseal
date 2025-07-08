import Mana from "../classes/Mana";
import { Card } from "../classes/Card";

class CardCreator extends Card {
  cast() {}

  resolve(): void {}
}

export default function () {
  const card = new CardCreator({
    gameId: 230897,
    name: "Grizzled Outrider",
    type: "creature",
    typeLine: "Creature — Elf Warrior",
    text: "",
    summoningSickness: true,
    defaultPower: 5,
    defaultToughness: 5,
    manaCost: new Mana({
      green: 1,
      colorless: 4,
    }),
    keywords: [],
  });

  return card;
}
