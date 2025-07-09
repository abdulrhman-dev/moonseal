import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Player from "../classes/Player";
import type Game from "@backend/classes/Game";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {
    player.gameRef.flags.preventDamage = true;
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 118683,
      name: "Fog",
      type: "instant",
      typeLine: "Instant",
      text: "Prevent all combat damage that would be dealt this turn.",
      summoningSickness: false,
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({
        green: 1,
        colorless: 0,
      }),
      keywords: [],
    },
    game
  );

  return card;
}
