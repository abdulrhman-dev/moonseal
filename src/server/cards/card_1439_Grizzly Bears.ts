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
      gameId: 1439,
      name: "Grizzly Bears",
      type: "creature",
      typeLine: "Creature — Bear",
      text: "",
      summoningSickness: true,
      defaultPower: 2,
      defaultToughness: 2,
      manaCost: new Mana({
        green: 1,
        colorless: 1,
      }),
      keywords: [],
    },
    game
  );

  return card;
}
