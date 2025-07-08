import type {
  CardState,
  TargetData,
  TargetSelectGroup,
} from "@backend/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CardTypes } from "@backend/types/cards";
import type { CardLocations } from "@/components/Card";

export type Target = {
  type: CardTypes;
  player: 1 | 2;
  data: CardState;
  location: CardLocations;
  isAttacker?: boolean;
};

export type TargetingState = {
  targets: Target[];
  targetsRules: TargetSelectGroup;
  selectedRules: boolean[];
  text: string;
  type: "AND" | "OR";
  mode: "manual" | "auto";
};

export type InitilizeTargetingArgs = {
  data: TargetData;
  mode: "auto" | "manual";
};

const initialState: TargetingState = {
  targets: [],
  targetsRules: [],
  selectedRules: [],
  text: "",
  type: "AND",
  mode: "manual",
};

const targetingSlice = createSlice({
  name: "targeting",
  initialState,
  reducers: {
    initilizeTargets(state, action: PayloadAction<InitilizeTargetingArgs>) {
      state.targetsRules = action.payload.data.targetSelects;
      state.selectedRules = action.payload.data.targetSelects.map(() => false);
      state.text = action.payload.data.text;
      state.type = action.payload.data.type;
      state.mode = action.payload.mode;
    },
    addTarget(state, action: PayloadAction<Target>) {
      const targetIndex = state.targetsRules.findIndex(
        (targetRule) =>
          targetRule.amount > 0 &&
          (targetRule.type === "all" ||
            targetRule.type === action.payload.type) &&
          (targetRule.location === "all" ||
            targetRule.location === action.payload.location) &&
          (targetRule.player === 0 ||
            targetRule.player === action.payload.player) &&
          (targetRule.isAttacker ? action.payload.isAttacker : true) &&
          (targetRule.isTapped ? action.payload.data.tapped : true)
      );

      if (targetIndex === -1) return;

      state.targets.push(action.payload);
      state.targetsRules[targetIndex].amount--;
      state.selectedRules[targetIndex] = true;
    },
    removeTarget(state, action: PayloadAction<number>) {
      state.targets = state.targets.filter(
        (target) => target.data.id !== action.payload
      );
    },
    clearTargets(state) {
      state = {
        ...state,
        ...initialState,
      };
    },
  },
});

export default targetingSlice.reducer;
export const { initilizeTargets, addTarget, removeTarget, clearTargets } =
  targetingSlice.actions;
