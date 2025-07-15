import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "../classes/Player";
import { updateBoard } from "../socket/handleGame";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {}

  getManaCost(): Mana {
    const totalCreaturesPower = this.gameRef
      .getPlayer(this.cardPlayer)
      .battlefield.creatures.collection.reduce(
        (prev, creature) => creature.totalPower + prev,
        0
      );
    return new Mana({
      green: 2,
      colorless: Math.max(10 - totalCreaturesPower, 0),
    });
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 591184,
      name: "Ghalta, Primal Hunger",
      type: "creature",
      typeLine: "Legendary Creature — Elder Dinosaur",
      text: `This spell costs {X} less to cast, where X is the total power of creatures you control.\nTrample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)`,
      summoningSickness: true,
      defaultPower: 12,
      defaultToughness: 12,
      manaCost: new Mana({
        green: 2,
        colorless: 10,
      }),
      keywords: ["Trample"],
    },
    game
  );

  return card;
}
