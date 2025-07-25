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
      gameId: 168484,
      name: "Gigantosaurus",
      type: "creature",
      typeLine: "Creature — Dinosaur",
      text: "",
      summoningSickness: true,
      defaultPower: 10,
      defaultToughness: 10,
      manaCost: new Mana({
        green: 5,
        colorless: 0,
      }),
      keywords: [],
    },
    game
  );

  return card;
}
