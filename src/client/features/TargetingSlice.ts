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
  askingCard: CardState | null;
  askingCardLocation: CardLocations | null;
  canCancel: boolean;
};

export type InitilizeTargetingArgs = {
  data: TargetData;
  mode: "auto" | "manual";
  canCancel?: boolean;
  askingCard?: CardState | null;
  askingCardLocation?: CardLocations | null;
};

const initialState: TargetingState = {
  targets: [],
  targetsRules: [],
  selectedRules: [],
  text: "",
  type: "AND",
  mode: "manual",
  canCancel: false,
  askingCard: null,
  askingCardLocation: null,
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
      state.canCancel = action.payload.canCancel
        ? action.payload.canCancel
        : state.canCancel;
      state.askingCard = action.payload.askingCard
        ? action.payload.askingCard
        : null;
      state.askingCardLocation = state.askingCardLocation
        ? state.askingCardLocation
        : null;
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
      state.mode = "manual";
      state.canCancel = false;
      state.askingCard = null;
      state.askingCardLocation = null;
    },
  },
});

export default targetingSlice.reducer;
export const { initilizeTargets, addTarget, removeTarget, clearTargets } =
  targetingSlice.actions;
