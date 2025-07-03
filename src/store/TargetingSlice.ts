import type { CardState, TargetSelect } from "@/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CardTypes } from "@/types/cards";
import type { CardLocations } from "@/components/Card";

type Target = {
  type: CardTypes | "attacker" | "hand";
  player: 1 | 2;
  data: CardState;
  location: CardLocations;
};

export type TargetingState = {
  targets: Target[];
  targetsRules: TargetSelect[];
};

const initialState: TargetingState = {
  targets: [],
  targetsRules: [],
};

const targetingSlice = createSlice({
  name: "targeting",
  initialState,
  reducers: {
    initilizeTargets(state, action: PayloadAction<TargetSelect[]>) {
      state.targetsRules = action.payload;
    },
    addTarget(state, action: PayloadAction<Target>) {
      let updateIndex = state.targetsRules.findIndex(
        (targetRule) =>
          targetRule.type === action.payload.type &&
          targetRule.player === action.payload.player &&
          targetRule.amount > 0
      );

      if (updateIndex !== -1) {
        state.targetsRules[updateIndex].amount--;
        state.targets.push(action.payload);
        return;
      }

      updateIndex = state.targetsRules.findIndex(
        (targetRule) =>
          targetRule.type === action.payload.location &&
          targetRule.player === action.payload.player &&
          targetRule.amount > 0
      );

      if (updateIndex !== -1) {
        state.targetsRules[updateIndex].amount--;
        state.targets.push(action.payload);
        return;
      }

      updateIndex = state.targetsRules.findIndex(
        (targetRule) =>
          targetRule.type === action.payload.type &&
          targetRule.player === 0 &&
          targetRule.amount > 0
      );

      if (updateIndex !== -1) {
        state.targetsRules[updateIndex].amount--;
        state.targets.push(action.payload);
        return;
      }
    },
    removeTarget(state, action: PayloadAction<number>) {
      state.targets = state.targets.filter(
        (target) => target.data.id !== action.payload
      );
    },
    clearTargets(state) {
      state.targets = [];
      state.targetsRules = [];
    },
  },
});

export default targetingSlice.reducer;
export const { initilizeTargets, addTarget, removeTarget, clearTargets } =
  targetingSlice.actions;
