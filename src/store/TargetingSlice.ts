import type { TargetSelect } from "@/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CardTypes } from "@/types/cards";

type Target = {
  type: CardTypes;
  player: 1 | 2;
  id: number;
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

      if (updateIndex === -1) {
        updateIndex = state.targetsRules.findIndex(
          (targetRule) =>
            targetRule.type === action.payload.type &&
            targetRule.player === 0 &&
            targetRule.amount > 0
        );

        if (updateIndex === -1) return;
      }

      state.targetsRules[updateIndex].amount--;
      state.targets.push(action.payload);
    },
    removeTarget(state, action: PayloadAction<number>) {
      state.targets = state.targets.filter(
        (target) => target.id !== action.payload
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
