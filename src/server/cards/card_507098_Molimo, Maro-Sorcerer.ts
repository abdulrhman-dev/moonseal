import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "../classes/Player";
import { updateBoard } from "../socket/handleGame";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {}

  get totalPower() {
    const x = this.gameRef.getPlayer(this.cardPlayer).battlefield.lands
      .collection.length;
    return x + this.modifiedPower + this.tempModifiedPower;
  }

  get totalToughness() {
    const x = this.gameRef.getPlayer(this.cardPlayer).battlefield.lands
      .collection.length;
    return x + this.modifiedToughness + this.tempModifiedToughness;
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 507098,
      name: "Molimo, Maro-Sorcerer",
      type: "creature",
      typeLine: "Legendary Creature — Elemental",
      text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nMolimo's power and toughness are each equal to the number of lands you control.`,
      summoningSickness: true,
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({
        green: 3,
        colorless: 4,
      }),
      keywords: ["Trample"],
    },
    game
  );

  return card;
}
