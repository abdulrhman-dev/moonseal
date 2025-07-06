import { moveToGraveyard, updateCard } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@backend/types/cards";
import { CardDefault } from "@backend/types/cards";
import { getRecentCard } from "../util/util";

const card: Card = {
  ...CardDefault,
  gameId: 180976,
  name: "Prey Upon",
  type: "sorcery",
  canTap: false,
  manaCost: {
    green: 1,
    colorless: 0,
  },
  targetData: [
    {
      type: "AND",
      text: "",
      targetSelects: [
        {
          type: "creature",
          amount: 1,
          player: 1,
          location: "battlefield",
        },
        {
          type: "creature",
          amount: 1,
          player: 2,
          location: "battlefield",
        },
      ],
    },
  ],
  summoningSickness: false,
  defaultPower: 0,
  defaultToughness: 0,
  typeLine: "Sorcery",
  text: "Target creature you control fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  keywords: ["Fight"],
  valid() {
    return (
      store.getState().players.player[0].battlefield.creatures.length > 0 &&
      store.getState().players.player[1].battlefield.creatures.length > 0
    );
  },
  resolve({ targets: rawTargets, cardPlayer }) {
    const targets = !rawTargets ? [] : rawTargets[0];

    if (!targets || targets.length !== 2 || !cardPlayer) return;

    const attacker = Object.assign({}, getRecentCard(targets[0].id));
    const blocker = Object.assign({}, getRecentCard(targets[1].id));

    if (!attacker || !blocker) return;

    attacker.toughness -= blocker.power;
    blocker.toughness -= attacker.power;

    store.dispatch(updateCard(attacker));
    store.dispatch(updateCard(blocker));

    store.dispatch(moveToGraveyard());
  },
};

export default card;
