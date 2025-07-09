import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "../classes/Player";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {
    const { targets: rawTargets } = args;

    const targets = !rawTargets.length ? [] : rawTargets[0];

    if (targets.length !== 2) return;

    const attacker = targets[0];
    const blocker = targets[1];

    attacker.damage += blocker.totalPower;
    blocker.damage += attacker.totalPower;

    player.gameRef.cleanupDeadCreatures();
  }

  canCast(game: Game): boolean {
    const player1 = game.getPlayer(1).battlefield.creatures;
    const player2 = game.getPlayer(2).battlefield.creatures;

    if (!player1.collection.length || !player2.collection.length) return false;

    return super.canCast(game);
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 180976,
      name: "Prey Upon",
      type: "sorcery",
      typeLine: "Sorcery",
      text: "Target creature you control fights target creature you don't control. (Each deals damage equal to its power to the other.)",
      summoningSickness: false,
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({
        green: 1,
        colorless: 0,
      }),
      keywords: ["Fight"],
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
        player: 1,
        location: "battlefield",
      },
      {
        type: "creature",
        amount: 1,
        player: 2,
        location: "battlefield",
      },
    ],
  });

  return card;
}
