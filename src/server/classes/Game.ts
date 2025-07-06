import Player from "./Player";
import type { Phases } from "../types/phases";

import { decks } from "../deck";

const flagDefault = {
  preventDamage: false,
};

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
  "NONE",
] as const;

// Game
// passPriority, client
// setDeclaredAttackers, client
// setDeclaredBlockers, client
// toggleAttacker, client
// toggleBlocker, client
// calculateDamage,
// cleanUpCombat,
// healCreatures,
// clearFlags,
// startGame, client
// nextPhase, client
// castSpell, client
class Game {
  players: [Player, Player];
  activePlayer: 0 | 1 | 2 = 0;
  priority: 0 | 1 | 2 = 0;
  priorityPassNum: number = 0;
  currentPhase: Phases = "NONE";
  //   fights: Fight[] = [];
  declaredAttackers: boolean = false;
  declaredBlockers: boolean = false;
  flags: {
    preventDamage: boolean;
  } = { ...flagDefault };

  constructor() {
    this.players = [new Player(1), new Player(2)];
  }

  async initlizeDecks() {
    for (const player of this.players) {
      await player.initializeLibrary(decks[player.playerNum - 1]);
    }
  }

  clearFlags() {
    for (const key of Object.keys(this.flags) as (keyof typeof this.flags)[]) {
      this.flags[key] = false;
    }
  }

  startGame() {
    this.currentPhase = "BEGINNING_UNTAP";
    this.activePlayer = 1;
    this.priority = 1;
    this.players[this.activePlayer - 1].turn++;
  }

  nextPhase() {
    const nextIndex =
      (PhasesArray.findIndex((phase) => phase === this.currentPhase) + 1) %
      (PhasesArray.length - 1);

    this.priorityPassNum = 0;

    if (nextIndex === 0) {
      this.players[this.activePlayer - 1].landsCasted = 0;
      this.activePlayer = (this.activePlayer ^ 3) as 1 | 2;
      this.priority = this.activePlayer;
      this.players[this.activePlayer - 1].turn++;
      this.declaredAttackers = false;
      this.declaredBlockers = false;
    }

    this.priority = this.activePlayer;
    this.currentPhase = PhasesArray[nextIndex];

    this.handlePhaseChange();
  }

  handlePhaseChange() {
    const player = this.players[this.activePlayer - 1];

    switch (this.currentPhase) {
      case "BEGINNING_UNTAP":
        player.unTapCards();
        player.removeSummoningSickness();
        this.nextPhase();
        break;
      case "BEGINNING_DRAW":
        if (player.turn !== 1) player.drawCard();
        this.nextPhase();
        break;
      case "BEGINNING_UNKEEP":
      case "COMBAT_BEGIN":
      case "COMBAT_END":
      case "END_STEP":
        this.nextPhase();
        break;
      case "COMBAT_ATTACK":
        break;
      case "COMBAT_BLOCK":
        break;
      case "COMBAT_DAMAGE":
        break;
      case "CLEANUP":
        break;
    }
  }
}

export default Game;
