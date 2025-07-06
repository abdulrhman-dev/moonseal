import { modifyManaPool } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 507123,
  name: "Elvish Mystic",
  type: "creature",
  canTap: true,
  manaCost: {
    green: 1,
    colorless: 0,
  },
  summoningSickness: true,
  defaultPower: 1,
  defaultToughness: 1,
  typeLine: "Creature — Elf Druid",
  text: "{T}: Add {G}.",
  activatedAbilities: [
    {
      cost: {
        mana: {},
        tap: true,
        sacrfice: [],
      },
      targets: [],
      text: "أحصل على مانا خضراء إضافية",
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
          green: playerManaPool["green"] + 1,
        })
      );
    },
    () => {},
  ],
  keywords: [],
  valid() {
    return true;
  },
};

export default card;
