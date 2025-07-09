import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Player from "../classes/Player";
import type Game from "@backend/classes/Game";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player, args: CardResolveServerArgs): void {}
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 161851,
      name: "Arbor Elf",
      type: "creature",
      typeLine: "Creature — Elf Druid",
      text: "{T}: Untap target Forest.",
      summoningSickness: true,
      defaultPower: 1,
      defaultToughness: 1,
      manaCost: new Mana({
        green: 1,
        colorless: 0,
      }),
      keywords: [],
    },
    game
  );

  card.addActivitedAbility(
    {
      cost: {
        mana: {},
        tap: true,
        sacrfice: [],
      },
      targets: [
        {
          text: "",
          type: "AND",
          targetSelects: [
            {
              amount: 1,
              type: "land",
              location: "battlefield",
              player: 0,
              isTapped: true,
            },
          ],
        },
      ],
      text: "أعد تنشيط أرض",
    },
    (_, { targets }) => {
      const chosen = targets?.[0];
      if (!chosen || chosen.length !== 1) return;

      chosen[0].unTapCard();
    }
  );

  return card;
}
