import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";
import { getRecentCard } from "../util/util";
import { store } from "@/store/store";
import { updateCard } from "@/store/PlayersSlice";

const card: Card = {
  ...CardDefault,
  gameId: 56311,
  name: "Elder of Laurels",
  type: "creature",
  canTap: false,
  manaCost: {
    // 1, 2
    green: 0,
    colorless: 0,
  },
  summoningSickness: true,
  defaultPower: 2,
  defaultToughness: 3,
  typeLine: "Creature — Human Advisor",
  text: "{3}{G}: Target creature gets +X/+X until end of turn, where X is the number of creatures you control.",
  activatedAbilities: [
    {
      cost: {
        tap: false,
        mana: {
          colorless: 3,
          green: 1,
        },
        sacrfice: [],
      },
      targets: [
        {
          amount: 1,
          player: 1,
          type: "creature",
        },
      ],
      text: "إضافية حتى نهاية الدور لمخلوق +ْX/+X",
    },
  ],
  activatedActions: [
    ({ targets, cardPlayer }) => {
      if (!targets || !cardPlayer || targets.length !== 1) return;

      const x =
        store.getState().players.player[cardPlayer - 1].battlefield.creatures
          .length;

      const card = Object.assign({}, getRecentCard(targets[0].id));

      store.dispatch(
        updateCard({
          ...card,
          power: card.power + x,
          toughness: card.toughness + x,
        })
      );
    },
  ],
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
