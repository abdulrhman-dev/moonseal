import { StartAppListening } from "../store";
import { castSpell } from "../PlayersSlice";
import { resolveTopCard } from "@/game/handlers/handlePriorityChange";
import { checkNeedPriority } from "@/game/logic/checkBoard";

export const addPlayerListener = () => {
  StartAppListening({
    actionCreator: castSpell,
    effect: async (action, api) => {
      if (action.payload.type === "SHOWCASE") return;

      const players = api.getState().players;

      const nextNeedPriority = await checkNeedPriority(
        players,
        (players.priority ^ 3) as 1 | 2
      );

      if (!nextNeedPriority) {
        const spellStack = players.spell_stack;
        resolveTopCard(spellStack[spellStack.length - 1], api.dispatch);
      }
    },
  });
};
