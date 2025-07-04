import { updateCard } from "@/store/PlayersSlice";
import { store } from "@/store/store";
import type { Card } from "@/types/cards";
import { CardDefault } from "@/types/cards";
import { getRecentCard, getRecentEnchantment } from "../util/util";

const card: Card = {
  ...CardDefault,
  gameId: 535861,
  name: "Wild Growth",
  type: "enchantment",
  manaCost: {
    green: 1,
  },
  targetData: [
    {
      text: "",
      type: "AND",
      targetSelects: [
        {
          type: "land",
          amount: 1,
          location: "battlefield",
          player: 1,
        },
      ],
    },
  ],
  typeLine: "Enchantment — Aura",
  text: "Enchant land\nWhenever enchanted land is tapped for mana, its controller adds an additional {G}.",
  keywords: ["Enchant"],
  triggers: {
    RESOLVES: ({ targets: rawTargets, selfId }) => {
      const card = getRecentEnchantment(selfId);
      const targets = !rawTargets ? [] : rawTargets[0];

      if (!targets || targets.length !== 1 || !card || card.gameId !== 535861)
        return;

      const oldLand = getRecentCard(targets[0].id);

      if (!oldLand) return;

      store.dispatch(
        updateCard({
          ...oldLand,
          manaGiven: {
            ...oldLand.manaGiven,
            green: (oldLand.manaGiven.green || 0) + 1,
          },
        })
      );
    },
  },
  canTap: false,
  summoningSickness: false,
  valid() {
    return (
      store.getState().players.player[0].battlefield.lands.length > 0 ||
      store.getState().players.player[1].battlefield.lands.length > 0
    );
  },
};

export default card;
