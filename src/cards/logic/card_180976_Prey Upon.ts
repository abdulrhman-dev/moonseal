import { moveToGraveyard, updateCard } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 180976,
  name: "Prey Upon",
  type: "sorcery",
  canTap: false,
  manaCost: {
    green: 0,
    colorless: 0,
  },
  targetSelects: [
    {
      type: "creature",
      amount: 1,
      player: 1,
    },
    {
      type: "creature",
      amount: 1,
      player: 2,
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
  resolve({ targets }) {
    if (!targets || targets.length !== 2) return;

    const attacker = { ...targets[0] };
    const blocker = { ...targets[1] };

    attacker.toughness -= blocker.power;
    blocker.toughness -= attacker.power;

    store.dispatch(updateCard(attacker));
    store.dispatch(updateCard(blocker));

    store.dispatch(moveToGraveyard());
  },
};

export default card;
