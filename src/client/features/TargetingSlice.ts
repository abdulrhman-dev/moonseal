import type {
  CardState,
  TargetData,
  TargetSelectGroup,
} from "@backend/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CardTypes } from "@backend/types/cards";
import type { CardLocations } from "@/components/Card";

type Target = {
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
};

const initialState: TargetingState = {
  targets: [],
  targetsRules: [],
  selectedRules: [],
  text: "",
  type: "AND",
};

const targetingSlice = createSlice({
  name: "targeting",
  initialState,
  reducers: {
    initilizeTargets(state, action: PayloadAction<TargetData>) {
      state.targetsRules = action.payload.targetSelects;
      state.selectedRules = action.payload.targetSelects.map(() => false);
      state.text = action.payload.text;
      state.type = action.payload.type;
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
      state.targets = [];
      state.targetsRules = [];
      state.selectedRules = [];
      state.text = "";
      state.type = "AND";
    },
  },
});

export default targetingSlice.reducer;
export const { initilizeTargets, addTarget, removeTarget, clearTargets } =
  targetingSlice.actions;
