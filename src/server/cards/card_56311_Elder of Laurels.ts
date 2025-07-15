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
      gameId: 56311,
      name: "Elder of Laurels",
      type: "creature",
      typeLine: "Creature — Human Advisor",
      text: "{3}{G}: Target creature gets +X/+X until end of turn, where X is the number of creatures you control.",
      summoningSickness: true,
      defaultPower: 2,
      defaultToughness: 3,
      manaCost: new Mana({
        green: 1,
        colorless: 2,
      }),
      keywords: [],
    },
    game
  );

  card.addActivitedAbility(
    {
      cost: {
        tap: false,
        mana: {
          green: 1,
          colorless: 3,
        },
        sacrfice: [],
      },
      targets: [
        {
          text: "",
          type: "AND",
          targetSelects: [
            {
              type: "creature",
              location: "battlefield",
              amount: 1,
              player: 1,
            },
          ],
        },
      ],
      text: "إضافية حتى نهاية الدور لمخلوق +X/+X",
    },
    (player, { targets }) => {
      const chosen = targets?.[0];
      if (!chosen || chosen.length !== 1) return;

      const x = player.battlefield.creatures.collection.length;
      const target = chosen[0];

      target.tempModifiedPower += x;
      target.tempModifiedToughness += x;
    }
  );

  return card;
}
