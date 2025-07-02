import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

import { store } from "@/store/store";
import { updateCard } from "@/store/PlayersSlice";
import { validTargets } from "../util/util";

const card: Card = {
  ...CardDefault,
  gameId: 559550,
  name: "Giant Growth",
  type: "instant",
  canTap: false,
  manaCost: {
    green: 0,
    colorless: 0,
  },
  targetSelects: [{ type: "creature", amount: 1, player: 0 }],
  summoningSickness: false,
  defaultPower: 0,
  defaultToughness: 0,
  typeLine: "Instant",
  text: "Target creature gets +3/+3 until end of turn.",
  keywords: [],
  valid() {
    return (
      store.getState().players.player[0].battlefield.creatures.length > 0 ||
      store.getState().players.player[0].battlefield.creatures.length > 0
    );
  },
  resolve({ targets }) {
    console.log(targets);

    if (!targets || targets.length !== 1 || !validTargets(targets)) return;
    store.dispatch(
      updateCard({
        ...targets[0],
        toughness: targets[0].toughness + 3,
        power: targets[0].power + 3,
      })
    );
  },
};

export default card;
