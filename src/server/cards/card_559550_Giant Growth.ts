import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "../classes/Player";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {
    const { targets: rawTargets } = args;

    const targets = !rawTargets.length ? [] : rawTargets[0];

    if (targets.length !== 1) return;

    targets[0].tempModifiedPower += 3;
    targets[0].tempModifiedToughness += 3;

    player.gameRef.cleanupDeadCreatures();
  }

  canCast(game: Game): boolean {
    const player1 = game.getPlayer(1).battlefield.creatures;
    const player2 = game.getPlayer(2).battlefield.creatures;

    if (!player1.collection.length && !player2.collection.length) return false;

    return super.canCast(game);
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 559550,
      name: "Giant Growth",
      type: "instant",
      typeLine: "Instant",
      text: "Target creature gets +3/+3 until end of turn.",
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

  card.addTargetSelector({
    type: "AND",
    text: "",
    targetSelects: [
      {
        type: "creature",
        amount: 1,
        location: "battlefield",
        player: 0,
      },
    ],
  });

  return card;
}
