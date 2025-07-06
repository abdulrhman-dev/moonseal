import { modifyManaPool } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 33313,
  name: "Greenweaver Druid",
  type: "creature",
  manaCost: {
    green: 1,
    colorless: 2,
  },
  canTap: true,
  summoningSickness: true,
  defaultPower: 1,
  defaultToughness: 1,
  typeLine: "Creature — Elf Druid",
  text: "{T}: Add {G}{G}.",
  activatedAbilities: [
    {
      cost: {
        mana: {},
        tap: true,
        sacrfice: [],
      },
      targets: [],
      text: "أحصل على 2 مانا خضراء إضافية",
    },
  ],
  activatedActions: [
    ({ cardPlayer }) => {
      if (!cardPlayer) return;
      const playerManaPool =
        store.getState().players.player[cardPlayer - 1].mana;

      store.dispatch(
        modifyManaPool({
          ...playerManaPool,
          green: playerManaPool.green + 2,
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
