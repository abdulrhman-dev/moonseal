import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Player from "../classes/Player";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {}
}

export default function () {
  const card = new CardCreator({
    gameId: 33313,
    name: "Greenweaver Druid",
    type: "creature",
    typeLine: "Creature — Elf Druid",
    text: "{T}: Add {G}{G}.",
    summoningSickness: true,
    defaultPower: 1,
    defaultToughness: 1,
    manaCost: new Mana({
      green: 1,
      colorless: 2,
    }),
    keywords: [],
  });

  card.addActivitedAbility(
    {
      cost: {
        mana: {},
        tap: true,
        sacrfice: [],
      },
      targets: [],
      text: "أحصل على 2 مانا خضراء إضافية",
    },
    (player) => {
      player.addManaPool(
        new Mana({
          green: 2,
        })
      );
    }
  );

  return card;
}
