import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

// import type { RootState } from "@/store/store";
// import { store } from "@/store/store";

import { getCards } from "../util/util";

const card: Card = {
  ...CardDefault,
  game_id: 559550,
  type: "instant",
  name: "Giant Growth",
  can_tap: false,
  mana_cost: {
    green: 1,
  },
  type_line: "Instant",
  text: "Target creature gets +3/+3 until end of turn.",
  target_selects: [
    {
      amount: 1,
      type: "creature",
      playerType: 2,
    },
  ],
  cast({ targets }) {
    console.log(targets);
    const cards = getCards((card) => targets.includes(card.id));

    console.log(cards);
  },
  valid() {
    return true;
  },
};

export default card;
