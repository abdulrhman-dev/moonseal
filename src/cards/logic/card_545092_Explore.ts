import { drawCard, setLandsUsed } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";

const card: Card = {
  ...CardDefault,
  gameId: 545092,
  name: "Explore",
  type: "sorcery",
  canTap: false,
  manaCost: {
    green: 0,
    colorless: 0,
  },
  summoningSickness: false,
  defaultPower: 0,
  defaultToughness: 0,
  typeLine: "Sorcery",
  text: "You may play an additional land this turn.\nDraw a card.",
  keywords: [],
  valid() {
    return true;
  },
  resolve({ cardPlayer }) {
    console.log(cardPlayer);
    if (!cardPlayer) return;
    const state = store.getState();

    store.dispatch(drawCard());
    store.dispatch(
      setLandsUsed({
        amount: state.players.player[cardPlayer - 1].landsCasted - 1,
        cardPlayer,
      })
    );
  },
};

export default card;
