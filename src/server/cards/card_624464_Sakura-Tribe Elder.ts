import Mana from "../classes/Mana";
import { Card } from "../classes/Card";
import type Player from "@backend/classes/Player";
class CardCreator extends Card {
  cast() {}

  resolve(): void {}
}

export default function () {
  const card = new CardCreator({
    gameId: 624464,
    name: "Sakura-Tribe Elder",
    type: "creature",
    typeLine: "Creature — Snake Shaman",
    text: "Sacrifice this creature: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
    summoningSickness: true,
    defaultPower: 1,
    defaultToughness: 1,
    manaCost: new Mana({
      green: 1,
      colorless: 1,
    }),
    keywords: [],
  });

  card.addActivitedAbility(
    {
      cost: {
        mana: {},
        sacrfice: [],
        tap: false,
        sacrificeSelf: true,
      },
      targets: [],
      text: "ضف أرض مشحونه",
    },
    (player) => {
      const land = player.library.collection.find(
        (card) => card.data.type === "land"
      );

      if (!land) return;

      player.library.remove(land.id);
      player.battlefield.lands.add(land);
      land.tapCard();

      player.library.shuffle();
    }
  );

  return card;
}
