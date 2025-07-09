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
      gameId: 559542,
      name: "Forest",
      type: "land",
      typeLine: "Basic Land — Forest",
      text: "({T}: Add {G}.)",
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({}),
      manaGiven: new Mana({
        green: 1,
      }),
      summoningSickness: false,
      keywords: [],
    },
    game
  );

  return card;
}
