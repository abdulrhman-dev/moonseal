import type { CardResolveData, CardState, Mana } from "@backend/types/cards";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { PhasesArray, type Phases } from "@backend/types/phases";

import type { TriggerNames } from "@backend/types/triggers";
import type {
  activePlayerChangeArgs,
  fightChangeArgs,
  listChangeArgs,
  priorityChangeArgs,
} from "@backend/types/socket";

export type StackAbility = {
  card: CardState;
  args: CardResolveData;
  castedPlayer: 1 | 2;
  type: ["TRIGGER", TriggerNames] | ["ACTIVATED", number] | "CAST" | "SHOWCASE";
};

export type PlayerMana = Required<Mana>;

export type Player = {
  graveyard: CardState[];
  exile: CardState[];
  hand: CardState[];
  battlefield: {
    creatures: CardState[];
    lands: CardState[];
  };
  mana: PlayerMana;
  life: number;
  ready: boolean;
};

export type OpponentPlayer = {
  graveyard: CardState[];
  exile: CardState[];
  hand: CardState[];
  battlefield: {
    creatures: CardState[];
    lands: CardState[];
  };
  life: number;
  ready: boolean;
};

export type Fight = {
  attacker: number;
  blockers: number[];
};

export type GameState = {
  player: Player;
  opponentPlayer: OpponentPlayer;
  priority: 0 | 1 | 2;
  currentPhase: Phases;
  spellStack: StackAbility[];
  fights: Fight[];
  declaredAttackers: boolean;
  declaredBlockers: boolean;
  isActive: boolean;
};

const PlayerDefault: Player = {
  hand: [],
  graveyard: [],
  exile: [],
  battlefield: {
    creatures: [],
    lands: [],
  },
  life: 20,
  mana: {
    red: 0,
    green: 0,
    white: 0,
    blue: 0,
    black: 0,
    colorless: 0,
  },
  ready: false,
};

const OpponentPlayerDefault: OpponentPlayer = {
  hand: [],
  graveyard: [],
  exile: [],
  battlefield: {
    creatures: [],
    lands: [],
  },
  life: 20,
  ready: false,
};

const initialState: GameState = {
  player: { ...PlayerDefault },
  opponentPlayer: { ...OpponentPlayerDefault },

  priority: 0,
  currentPhase: "NONE",
  isActive: false,

  spellStack: [],

  fights: [],
  declaredAttackers: false,
  declaredBlockers: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    changeList(state, action: PayloadAction<listChangeArgs>) {
      const { type, list, listName } = action.payload;
      const player = type === "player" ? state.player : state.opponentPlayer;

      // typescript for some reason hates it when I don't seperate the conditions
      if (listName == "battlefield") player[listName] = list;
      else player[listName] = list;
    },
    changePriority(state, action: PayloadAction<priorityChangeArgs>) {
      const { phase, priority } = action.payload;

      state.currentPhase = phase;
      state.priority = priority;
    },
    changeActive(state, action: PayloadAction<activePlayerChangeArgs>) {
      const { activePlayer } = action.payload;
      console.log(activePlayer);
      state.isActive = activePlayer;
    },
    changeFights(state, action: PayloadAction<fightChangeArgs>) {
      const { declaredAttackers, declaredBlockers, fights } = action.payload;

      state.fights = fights;
      state.declaredAttackers = declaredAttackers;
      state.declaredBlockers = declaredBlockers;
    },
  },
});

export default gameSlice.reducer;
export const { changeList, changePriority, changeActive, changeFights } =
  gameSlice.actions;
