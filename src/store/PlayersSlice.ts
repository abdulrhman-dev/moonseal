import type { CardResolveData, CardState, Mana } from "@/types/cards";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PhasesArray, type Phases } from "@/types/phases";

import type { TriggerNames } from "@/types/triggers";

export type StackAbility = {
  card: CardState;
  args: CardResolveData;
  castedPlayer: 1 | 2;
  type: ["TRIGGER", TriggerNames] | ["ACTIVATED", number] | "CAST" | "SHOWCASE";
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
  ready: boolean;
};

export type Fight = {
  attacker: number;
  blockers: number[];
};

export type PlayersState = {
  player: [Player, Player];
  current_player: 0 | 1 | 2;
  priority: 0 | 1 | 2;
  priorityPassNum: number;
  id_counter: number;
  current_phase: Phases;
  spell_stack: StackAbility[];
  fights: Fight[];
  declaredAttackers: boolean;
  declaredBlockers: boolean;
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
  ready: false,
};

const initialState: PlayersState = {
  player: [{ ...PlayerDefault }, { ...PlayerDefault }],
  current_player: 0,
  priority: 0,
  id_counter: 0,
  current_phase: "NONE",
  spell_stack: [],
  fights: [],
  priorityPassNum: 0,
  declaredAttackers: false,
  declaredBlockers: false,
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
    drawCard(state, action: PayloadAction<1 | 2 | undefined>) {
      let player = -1;

      if (action.payload) player = action.payload;
      else player = state.current_player;

      const topCard = state.player[player - 1].library.pop();

      if (!topCard) return;

      state.player[player - 1].hand.push(topCard);
    },
    startGame(state, action: PayloadAction<1 | 2>) {
      state.current_phase = "BEGINNING_UNTAP";
      state.current_player = action.payload;
      state.priority = action.payload;
      state.player[state.current_player - 1].turn++;
    },
    updateCard(state, action: PayloadAction<CardState>) {
      for (const player of [1, 2]) {
        for (const location of [
          "graveyard",
          "library",
          "hand",
          "exile",
        ] as const) {
          const oldCardIndex = state.player[player - 1][location].findIndex(
            (card) => card.id === action.payload.id
          );

          if (oldCardIndex !== -1) {
            const oldCard = state.player[player - 1][location][oldCardIndex];

            state.player[player - 1][location][oldCardIndex] = {
              ...oldCard,
              ...action.payload,
            };
            return;
          }
        }

        for (const location of ["creatures", "lands"] as const) {
          const oldCardIndex = state.player[player - 1].battlefield[
            location
          ].findIndex((card) => card.id === action.payload.id);

          if (oldCardIndex !== -1) {
            const oldCard =
              state.player[player - 1].battlefield[location][oldCardIndex];

            state.player[player - 1].battlefield[location][oldCardIndex] = {
              ...oldCard,
              ...action.payload,
            };
            return;
          }
        }
      }
    },
    nextPhase(state) {
      const nextIndex =
        (PhasesArray.findIndex((phase) => phase === state.current_phase) + 1) %
        (PhasesArray.length - 1);

      state.priorityPassNum = 0;

      // toggle between the two players
      if (nextIndex === 0) {
        state.player[state.current_player - 1].landsCasted = 0;
        state.current_player = (state.current_player ^ 3) as 1 | 2;
        state.priority = state.current_player;
        state.player[state.current_player - 1].turn++;
        state.declaredAttackers = false;
        state.declaredBlockers = false;
      }

      state.priority = state.current_player;
      state.current_phase = PhasesArray[nextIndex];
    },
    removeSummoningSickness(state) {
      state.player[state.current_player - 1].battlefield.creatures.forEach(
        (creature) => {
          creature.summoningSickness = false;
        }
      );
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
      // remove attacker if it already exits
      if (state.fights.find((fight) => fight.attacker === action.payload)) {
        state.fights = state.fights.filter(
          (fight) => fight.attacker !== action.payload
        );
        return;
      }

      // add attacker
      state.fights.push({
        attacker: action.payload,
        blockers: [],
      });
    },
    toggleBlocker(
      state,
      action: PayloadAction<{ id: number; target: number }>
    ) {
      const fight = state.fights.find((blocker) =>
        blocker.blockers.includes(action.payload.id)
      );

      if (fight) {
        fight.blockers = fight.blockers.filter(
          (blocker) => blocker !== action.payload.id
        );
      }

      const newFight = state.fights.find(
        (fight) => fight.attacker === action.payload.target
      );

      if (!newFight) return;

      newFight.blockers.push(action.payload.id);
    },
    calculateDamage(state) {
      const defendingPlayer = state.current_player ^ 3;

      for (const fight of state.fights) {
        const attacker = state.player[
          state.current_player - 1
        ].battlefield.creatures.find(
          (attacker) => attacker.id === fight.attacker
        );

        if (!attacker) return;

        if (!fight.blockers.length) {
          state.player[defendingPlayer - 1].life -= attacker.power;
          continue;
        }

        for (const blockerId of fight.blockers) {
          const blocker = state.player[
            defendingPlayer - 1
          ].battlefield.creatures.find((blocker) => blocker.id === blockerId);

          if (!blocker) continue;

          const blockerToughness = blocker.toughness;

          blocker.toughness -= attacker.power;
          attacker.toughness -= blocker.power;

          attacker.power = Math.max(attacker.power - blockerToughness, 0);
        }

        attacker.power = attacker.defaultPower;
      }
    },
    cleanUpCombat(state) {
      for (const fight of state.fights) {
        const attacker = state.player[
          state.current_player - 1
        ].battlefield.creatures.find(
          (attacker) => attacker.id === fight.attacker
        );

        if (!attacker) continue;

        attacker.tapped = true;
      }

      // move to graveyard dead creatures
      for (const player of [1, 2]) {
        state.player[player - 1].battlefield.creatures = state.player[
          player - 1
        ].battlefield.creatures.filter((creature) => {
          if (creature.toughness <= 0)
            state.player[player - 1].graveyard.push(creature);

          return creature.toughness > 0;
        });
      }

      state.fights = [];
    },

    moveToGraveyard(state) {
      for (const player of [1, 2]) {
        state.player[player - 1].battlefield.creatures = state.player[
          player - 1
        ].battlefield.creatures.filter((creature) => {
          if (creature.toughness <= 0)
            state.player[player - 1].graveyard.push(creature);

          return creature.toughness > 0;
        });
      }
    },
    healCreatures(state) {
      for (const player of [1, 2]) {
        state.player[player - 1].battlefield.creatures = state.player[
          player - 1
        ].battlefield.creatures.map((creature) => {
          return {
            ...creature,
            power: creature.defaultPower,
            toughness: creature.defaultToughness,
          };
        });
      }
    },
    showcaseOnStack(state, action: PayloadAction<StackAbility>) {
      state.spell_stack.push(action.payload);
    },
    removeShowcase(state) {
      state.spell_stack.pop();
    },
    castSpell(state, action: PayloadAction<StackAbility>) {
      state.priorityPassNum = 0;
      state.spell_stack.push(action.payload);

      state.player[state.priority - 1].hand = state.player[
        state.priority - 1
      ].hand.filter((card) => card.id !== action.payload.card.id);
    },
    resolveSpell(state) {
      state.priority = state.current_player;
      state.priorityPassNum = 0;
      state.spell_stack.pop();
    },
    passPriority(state) {
      if (!state.priority) return;

      state.priorityPassNum++;
      state.priority = (state.priority ^ 3) as 1 | 2;
    },
    setDeclaredAttackers(state) {
      state.declaredAttackers = true;
    },
    setDeclaredBlockers(state) {
      state.declaredBlockers = true;
    },
    setLandsUsed(
      state,
      action: PayloadAction<{ cardPlayer: 1 | 2; amount: number }>
    ) {
      state.player[action.payload.cardPlayer - 1].landsCasted =
        action.payload.amount;
    },
    attachEnchantment(
      state,
      action: PayloadAction<{
        targetId: number;
        type: "lands" | "creatures";
        card: CardState;
      }>
    ) {
      const permanent = state.player[
        action.payload.card.cardPlayer - 1
      ].battlefield[action.payload.type].find(
        (card) => card.id === action.payload.targetId
      );

      if (!permanent) return;

      permanent.enchanters.push(action.payload.card);
    },
    setReady(state, action: PayloadAction<1 | 2>) {
      state.player[action.payload - 1].ready = true;
    },
    removeCardHand(
      state,
      action: PayloadAction<{ id: number; player: 1 | 2 }>
    ) {
      state.player[action.payload.player - 1].hand = state.player[
        action.payload.player - 1
      ].hand.filter((handCard) => {
        return handCard.id !== action.payload.id;
      });
    },
  },
});

export default playersSlice.reducer;
export const {
  pushLibrary,
  shuffleLibary,
  drawCard,
  unTapCards,
  removeSummoningSickness,
  startGame,
  nextPhase,
  modifyManaPool,
  tapCard,
  addToBattleField,
  incrementLandUsage,
  toggleAttacker,
  toggleBlocker,
  calculateDamage,
  cleanUpCombat,
  healCreatures,
  castSpell,
  resolveSpell,
  passPriority,
  setDeclaredAttackers,
  setDeclaredBlockers,
  updateCard,
  showcaseOnStack,
  removeShowcase,
  setLandsUsed,
  moveToGraveyard,
  attachEnchantment,
  setReady,
  removeCardHand,
} = playersSlice.actions;
