export const PhasesArray = [
  "BEGINNING_UNTAP",
  "BEGINNING_UNKEEP",
  "BEGINNING_DRAW",
  "MAIN_PHASE_1",
  "COMBAT_BEGIN",
  "COMBAT_ATTACK",
  "COMBAT_BLOCK",
  "COMBAT_DAMAGE",
  "COMBAT_END",
  "MAIN_PHASE_2",
  "END_STEP",
  "CLEANUP",
] as const;

export type Phases = (typeof PhasesArray)[number];
