import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "../classes/Player";
import { updateBoard } from "../socket/handleGame";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {
    const { targets: rawTargets } = args;
    const targets = !rawTargets ? [] : rawTargets[0];

    if (targets.length !== 1) return;

    targets[0].tempModifiedPower += 3;
    targets[0].tempModifiedToughness += 3;

    targets[0].tempKeywords.push("Trample");
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
      gameId: 93195,
      name: "Awaken the Bear",
      type: "instant",
      typeLine: "Instant",
      text: "Target creature gets +3/+3 and gains trample until end of turn.",
      summoningSickness: false,
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({
        green: 1,
        colorless: 2,
      }),
      keywords: [],
    },
    game
  );

  card.addTargetSelector({
    targetSelects: [
      {
        amount: 1,
        player: 0,
        type: "creature",
        location: "battlefield",
      },
    ],
    type: "AND",
    text: "",
  });
  return card;
}
