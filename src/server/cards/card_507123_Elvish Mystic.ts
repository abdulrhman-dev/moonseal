import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "../classes/Player";
import { updateBoard } from "../socket/handleGame";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {}
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 507123,
      name: "Elvish Mystic",
      type: "creature",
      typeLine: "Creature — Elf Druid",
      text: "{T}: Add {G}.",
      summoningSickness: false,
      defaultPower: 1,
      defaultToughness: 1,
      manaCost: new Mana({
        green: 1,
        colorless: 0,
      }),
      keywords: ["Fight"],
    },
    game
  );

  card.addActivitedAbility(
    {
      cost: {
        mana: {
          green: 1,
        },
        tap: true,
        sacrfice: [],
      },
      targets: [],
      text: "أحصل على مانا خضراء إضافية",
    },
    (player) => {
      player.addManaPool(
        new Mana({
          green: 1,
        })
      );
    }
  );

  return card;
}
