import type { CardResolveData } from "@backend/types/cards";
import type { TriggerNames } from "@backend/types/triggers";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TriggerElement = {
  id: number;
  game_id: number;
  name: string;
  args: CardResolveData;
};

export type TriggerState = {
  [Trigger in TriggerNames as `${Trigger}`]: TriggerElement[];
};

export type AddAction = {
  name: TriggerNames;
  data: TriggerElement;
};

const initialState: TriggerState = {
  CARD_TAP: [],
  RESOLVES: [],
};

const triggerSlice = createSlice({
  name: "trigger",
  initialState,
  reducers: {
    addTrigger(state, action: PayloadAction<AddAction>) {
      state[action.payload.name].push(action.payload.data);
    },
    removeTrigger(
      state,
      action: PayloadAction<{ name: TriggerNames; id: number }>
    ) {
      state[action.payload.name] = state[action.payload.name].filter(
        (trigger) => trigger.id === action.payload.id
      );
    },
  },
});

export default triggerSlice.reducer;
export const { addTrigger, removeTrigger } = triggerSlice.actions;
