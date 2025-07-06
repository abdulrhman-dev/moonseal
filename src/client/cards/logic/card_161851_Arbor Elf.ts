import { upTapCard } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 161851,
  name: "Arbor Elf",
  type: "creature",
  manaCost: {
    green: 1,
    colorless: 0,
  },
  canTap: false,
  summoningSickness: true,
  defaultPower: 1,
  defaultToughness: 1,
  typeLine: "Creature — Elf Druid",
  text: "{T}: Untap target Forest.",
  activatedAbilities: [
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
  ],
  activatedActions: [
    ({ targets: rawTargets }) => {
      const targets = !rawTargets ? [] : rawTargets[0];

      if (!targets || targets.length !== 1) return;

      store.dispatch(upTapCard(targets[0].id));
    },
  ],
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
