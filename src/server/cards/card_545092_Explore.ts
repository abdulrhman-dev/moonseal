import Mana from "../classes/Mana";
import { Card } from "../classes/Card";
import type Player from "../classes/Player";
import type Game from "@backend/classes/Game";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player): void {
    player.landsCasted--;
    player.drawCard();
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 545092,
      name: "Explore",
      type: "sorcery",
      typeLine: "Sorcery",
      text: "You may play an additional land this turn.\nDraw a card.",
      summoningSickness: false,
      defaultPower: 0,
      defaultToughness: 0,
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
