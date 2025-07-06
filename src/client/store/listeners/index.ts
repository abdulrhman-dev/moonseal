import { addPlayerListener } from "./PlayerListener";
import { addTriggerListenr } from "./TriggerListener";

export const setupListeners = () => {
  addPlayerListener();
  addTriggerListenr();
};
