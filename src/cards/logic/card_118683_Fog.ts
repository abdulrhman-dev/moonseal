import { setFlag } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 118683,
  name: "Fog",
  type: "instant",
  manaCost: {
    green: 1,
    colorless: 0,
  },
  canTap: false,
  summoningSickness: false,
  defaultPower: 0,
  defaultToughness: 0,
  typeLine: "Instant",
  text: "Prevent all combat damage that would be dealt this turn.",
  activatedAbilities: [],
  activatedActions: [],
  keywords: [],
  resolve() {
    store.dispatch(setFlag({ key: "preventDamage", value: true }));
  },
  valid() {
    return true;
  },
};

export default card;
