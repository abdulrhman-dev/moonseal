import type { CardState } from "@/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Phases } from "@/types/phases";
import type { Triggers } from "@/types/triggers";

type ArgumentNames = Triggers extends [infer TriggerName, unknown]
  ? TriggerName
  : never;

type StackAbility = {
  card_id: number;
  type: ["TRIGGER", ArgumentNames] | ["ACTIVATED", number] | ["CAST"];
};

type Player = {
  library: CardState[];
  graveyard: CardState[];
  exile: CardState[];
  battlefield: {
    creatures: CardState[];
    lands: CardState[];
  };
  life: number;
};

type PlayersState = {
  current_player: Player;
  opposing_player: Player;
  playing_player: 0 | 1 | 2;
  priority: 0 | 1 | 2;
  idCounter: number;
  currentPhase: Phases;
  spellStack: StackAbility[];
  attackers: number[];
  blockers: {
    id: number;
    target: number;
  }[];
};

const initialState: PlayersState = {
  current_player: {
    library: [],
    graveyard: [],
    exile: [],
    battlefield: {
      creatures: [],
      lands: [],
    },
    life: 20,
  },
  opposing_player: {
    library: [],
    graveyard: [],
    exile: [],
    battlefield: {
      creatures: [],
      lands: [],
    },
    life: 20,
  },
  playing_player: 1,
  priority: 0,
  idCounter: 0,
  currentPhase: "BEGINNING_UNTAP",
  spellStack: [],
  attackers: [],
  blockers: [],
};

function shuffle(cards: unknown[]) {
  let i = cards.length;

  while (--i > 0) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = cards[j];
    cards[j] = cards[i];
    cards[i] = temp;
  }

  return cards;
}

const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    pushLibrary(
      state,
      action: PayloadAction<{ card: CardState; player: 1 | 2 }>
    ) {
      if (!action.payload.card.id) {
        state.idCounter++;
      }

      if (action.payload.player === 1) {
        state.current_player.library.push({
          ...action.payload.card,
          id: !action.payload.card.id
            ? state.idCounter
            : action.payload.card.id,
        });
      } else {
        state.opposing_player.library.push({
          ...action.payload.card,
          id: !action.payload.card.id
            ? state.idCounter
            : action.payload.card.id,
        });
      }
    },
    popLibary(state, action: PayloadAction<{ player: 1 | 2 }>) {
      if (action.payload.player === 1) {
        state.current_player.library.pop();
      } else {
        state.opposing_player.library.pop();
      }
    },
    shuffleLibary(state, action: PayloadAction<{ player: 1 | 2 }>) {
      if (action.payload.player === 1) {
        shuffle(state.current_player.library);
      } else {
        shuffle(state.opposing_player.library);
      }
    },
  },
});

export default playersSlice.reducer;
export const { pushLibrary, popLibary, shuffleLibary } = playersSlice.actions;
