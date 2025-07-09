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
      gameId: 69165,
      name: "Kalonian Tusker",
      type: "creature",
      typeLine: "Creature — Beast",
      text: "",
      summoningSickness: true,
      defaultPower: 3,
      defaultToughness: 3,
      manaCost: new Mana({
        green: 2,
        colorless: 0,
      }),
      keywords: [],
    },
    game
  );

  return card;
}
