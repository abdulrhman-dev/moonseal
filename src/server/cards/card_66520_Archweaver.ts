import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Player from "../classes/Player";
import type Game from "@backend/classes/Game";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {}
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 66520,
      name: "Archweaver",
      type: "creature",
      typeLine: "Creature — Spider",
      text: "Reach, trample",
      summoningSickness: true,
      defaultPower: 5,
      defaultToughness: 5,
      manaCost: new Mana({
        green: 2,
        colorless: 5,
      }),
      keywords: ["Reach", "Trample"],
    },
    game
  );

  return card;
}
