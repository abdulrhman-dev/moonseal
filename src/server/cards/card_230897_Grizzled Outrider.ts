import Mana from "../classes/Mana";
import { Card } from "../classes/Card";
import type Game from "@backend/classes/Game";

class CardCreator extends Card {
  cast() {}

  resolve(): void {}
}

export default function (game: Game) {
  const card = new CardCreator(
    {
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
    },
    game
  );

  return card;
}
