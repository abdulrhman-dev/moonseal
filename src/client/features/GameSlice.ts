import type { CardState, Mana } from "@backend/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Phases } from "@backend/types/phases";

import type {
  activePlayerChangeArgs,
  fightChangeArgs,
  listChangeArgs,
  playerChangeArgs,
  priorityChangeArgs,
} from "@backend/types/socket";

export type ClientStack = {
  data: CardState;
  type: "CAST" | "ABILITY" | "SHOWCASE";
  targets: number[];
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
  maxDamage: number;
  blockers: {
    id: number;
    damage: number;
  }[];
};

export type GameState = {
  player: Player;
  opponentPlayer: OpponentPlayer;
  priority: 0 | 1 | 2;
  currentPhase: Phases;
  spellStack: ClientStack[];
  lookup: CardState[];
  fights: Fight[];
  declaredAttackers: boolean;
  declaredBlockers: boolean;
  declaredAssignDamage: boolean;
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

  lookup: [],
  spellStack: [],

  fights: [],
  declaredAttackers: false,
  declaredBlockers: false,
  declaredAssignDamage: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    changeList(state, action: PayloadAction<listChangeArgs>) {
      if (action.payload.listName === "stack") {
        state.spellStack = action.payload.list;
        return;
      }

      if (action.payload.listName === "lookup") {
        state.lookup = action.payload.list;
        return;
      }

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
      state.isActive = activePlayer;
    },
    changeFights(state, action: PayloadAction<fightChangeArgs>) {
      const {
        declaredAttackers,
        declaredBlockers,
        declaredDamageAssign,
        fights,
      } = action.payload;

      state.fights = fights;
      state.declaredAttackers = declaredAttackers;
      state.declaredBlockers = declaredBlockers;
      state.declaredAssignDamage = declaredDamageAssign;
    },
    changePlayers(state, action: PayloadAction<playerChangeArgs>) {
      state.player = {
        ...state.player,
        ...action.payload.player,
      };

      state.opponentPlayer = {
        ...state.opponentPlayer,
        ...action.payload.opponenet,
      };
    },
    assignDamage(state, action: PayloadAction<{ amount: number; id: number }>) {
      const { amount, id } = action.payload;

      const fight = state.fights.find((fight) =>
        fight.blockers.map((blocker) => blocker.id).includes(id)
      );

      if (!fight) return;

      const blocker = fight.blockers.find((blocker) => blocker.id === id);

      if (!blocker) return;

      blocker.damage = amount;
    },
  },
});

export default gameSlice.reducer;
export const {
  changeList,
  changePriority,
  changeActive,
  changeFights,
  changePlayers,
  assignDamage,
} = gameSlice.actions;
