import type { Card } from "@/types/cards";
import { resolveSpell } from "../PlayersSlice";
import { StartAppListening } from "../store";

export const addTriggerListenr = () => {
  StartAppListening({
    actionCreator: resolveSpell,
    effect: async (action, api) => {
      const triggers = api.getState().triggers["RESOLVES"];
      console.log(api.getState().players.player);
      for (const trigger of triggers) {
        const cardImport = await import(
          `../../cards/logic/card_${trigger.game_id}_${trigger.name}`
        );
        const card = cardImport.default as Card;

        if (!card.triggers["RESOLVES"]) continue;
        card.triggers["RESOLVES"]({
          selfId: trigger.id,
          targets: trigger.args.targets,
        });
      }
    },
  });
};
