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
      gameId: 215615,
      name: "Garruk's Gorehorn",
      type: "creature",
      typeLine: "Creature — Beast",
      text: "",
      summoningSickness: true,
      defaultPower: 7,
      defaultToughness: 3,
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
