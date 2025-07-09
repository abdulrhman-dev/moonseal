import Mana from "../classes/Mana";
import { Card, enchantCard, type CardResolveServerArgs } from "../classes/Card";
import { cardDebuff } from "@/css/card.module.css";
import type Game from "@backend/classes/Game";
import type Player from "@backend/classes/Player";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {
    enchantCard(args, this);
  }

  canCast(game: Game): boolean {
    const player1 = game.getPlayer(1).battlefield.lands;
    const player2 = game.getPlayer(2).battlefield.lands;

    if (!player1.collection.length && !player2.collection.length) return false;
    return super.canCast(game);
  }

  enchant(card: Card) {
    if (!card.data.manaGiven) return;
    const manaAdded = new Mana({ green: 1 });
    card.data.manaGiven.add(manaAdded);
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 535861,
      name: "Wild Growth",
      type: "enchantment",
      typeLine: "Enchantment — Aura",
      text: "Enchant land\nWhenever enchanted land is tapped for mana, its controller adds an additional {G}.",
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({ green: 1 }),
      manaGiven: new Mana({}),
      summoningSickness: false,
      keywords: ["Enchant"],
    },
    game
  );

  card.addTargetSelector({
    text: "",
    type: "AND",
    targetSelects: [
      {
        type: "land",
        amount: 1,
        location: "battlefield",
        player: 1,
      },
    ],
  });

  return card;
}
