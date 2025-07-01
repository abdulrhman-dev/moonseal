import type { CardState, Mana } from "@/types/cards";
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

export type PlayerMana = Required<Mana>;

export type Player = {
  library: CardState[];
  graveyard: CardState[];
  exile: CardState[];
  hand: CardState[];
  battlefield: {
    creatures: CardState[];
    lands: CardState[];
  };
  mana: PlayerMana;
  life: number;
  turn: number;
  landsCasted: number;
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

const PlayerDefault: Player = {
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
  mana: {
    red: 0,
    green: 0,
    white: 0,
    blue: 0,
    black: 0,
    colorless: 0,
  },
  landsCasted: 0,
};

const initialState: PlayersState = {
  player: [{ ...PlayerDefault }, { ...PlayerDefault }],
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
      for (const i in state.player[state.current_player - 1].battlefield
        .creatures) {
        state.player[state.current_player - 1].battlefield.creatures[i].tapped =
          false;
      }

      for (const i in state.player[state.current_player - 1].battlefield
        .lands) {
        state.player[state.current_player - 1].battlefield.lands[i].tapped =
          false;
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
        state.player[state.current_player - 1].landsCasted = 0;
        // state.current_player ^= 3;
        state.player[state.current_player - 1].turn++;
      }

      state.current_phase = PhasesArray[nextIndex];
    },
    modifyManaPool(state, action: PayloadAction<PlayerMana>) {
      state.player[state.current_player - 1].mana = {
        ...state.player[state.current_player - 1].mana,
        ...action.payload,
      };
    },
    incrementLandUsage(state) {
      state.player[state.current_player - 1].landsCasted++;
    },
    tapCard(state, action: PayloadAction<number>) {
      // TODO: CHANGE THIS TO BE MORE Effecient
      state.player[state.current_player - 1].battlefield.lands.forEach(
        (land) => {
          if (land.id == action.payload && !land.tapped) land.tapped = true;
        }
      );

      state.player[state.current_player - 1].battlefield.creatures.forEach(
        (creature) => {
          if (creature.id == action.payload && !creature.tapped)
            creature.tapped = true;
        }
      );
    },
    addToBattleField(state, action: PayloadAction<CardState>) {
      state.player[state.current_player - 1].hand = state.player[
        state.current_player - 1
      ].hand.filter((handCard) => {
        return handCard.id !== action.payload.id;
      });

      if (action.payload.type === "creature") {
        state.player[state.current_player - 1].battlefield.creatures.push(
          action.payload
        );
      } else if (action.payload.type === "land") {
        state.player[state.current_player - 1].battlefield.lands.push(
          action.payload
        );
      }
    },
    toggleAttacker(state, action: PayloadAction<number>) {
      if (state.attackers.includes(action.payload)) {
        // remove attacker
        state.attackers = state.attackers.filter(
          (attacker) => attacker !== action.payload
        );
        return;
      }
      // add attacker
      state.attackers.push(action.payload);
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
  modifyManaPool,
  tapCard,
  addToBattleField,
  incrementLandUsage,
  toggleAttacker,
} = playersSlice.actions;
