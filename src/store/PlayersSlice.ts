import type { CardState } from "@/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PhasesArray, type Phases } from "@/types/phases";

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
  hand: CardState[];
  battlefield: {
    creatures: CardState[];
    lands: CardState[];
  };
  life: number;
  turn: number;
};

export type PlayersState = {
  player: [Player, Player];
  current_player: 0 | 1 | 2;
  priority: 0 | 1 | 2;
  id_counter: number;
  current_phase: Phases;
  spell_stack: StackAbility[];
  attackers: number[];
  blockers: {
    id: number;
    target: number;
  }[];
};

const initialState: PlayersState = {
  player: [
    {
      hand: [],
      library: [],
      graveyard: [],
      exile: [],
      battlefield: {
        creatures: [],
        lands: [],
      },
      life: 20,
      turn: 0,
    },
    {
      hand: [],
      library: [],
      graveyard: [],
      exile: [],
      battlefield: {
        creatures: [],
        lands: [],
      },
      life: 20,
      turn: 0,
    },
  ],
  current_player: 0,
  priority: 0,
  id_counter: 0,
  current_phase: "NONE",
  spell_stack: [],
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
        state.id_counter++;
      }

      state.player[action.payload.player - 1].library.push({
        ...action.payload.card,
        id: !action.payload.card.id ? state.id_counter : action.payload.card.id,
      });
    },
    shuffleLibary(state, action: PayloadAction<{ player: 1 | 2 }>) {
      shuffle(state.player[action.payload.player - 1].library);
    },
    unTapCards(state) {
      for (const player of [1, 2] as const) {
        state.player[player - 1].battlefield.creatures.forEach((card) => {
          card.tapped = false;
        });
      }
    },
    drawCard(state) {
      const topCard = state.player[state.current_player - 1].library.pop();

      if (!topCard) return;

      state.player[state.current_player - 1].hand.push(topCard);
    },
    startGame(state) {
      state.current_phase = "BEGINNING_UNTAP";
      state.current_player = 1;
      state.player[state.current_player - 1].turn++;

      for (let i = 0; i < 7; ++i) {
        for (const player of [1, 2] as const) {
          const topCard = state.player[player - 1].library.pop();
          if (topCard) state.player[player - 1].hand.push(topCard);
        }
      }
    },
    nextPhase(state) {
      const nextIndex =
        (PhasesArray.findIndex((phase) => phase === state.current_phase) + 1) %
        (PhasesArray.length - 1);

      // toggle between the two players
      if (nextIndex === 0) {
        state.current_player ^= 3;
        state.player[state.current_player - 1].turn++;
      }

      state.current_phase = PhasesArray[nextIndex];
    },
  },
});

export default playersSlice.reducer;
export const {
  pushLibrary,
  shuffleLibary,
  drawCard,
  unTapCards,
  startGame,
  nextPhase,
} = playersSlice.actions;
