import Player from "./Player";
import type { Phases } from "../types/phases";

import { decks } from "../deck";
import type { IO, ServerSocket } from "../types/socket";
import {
  updateActivePlayer,
  updateBoard,
  updatePriority,
} from "../socket/handleGame";

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
  players: Player[] = [];
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
  network: {
    io: IO;
    playerSockets: ServerSocket[];
  };

  constructor(io: IO, playerSockets: ServerSocket[]) {
    this.network = {
      io,
      playerSockets,
    };

    for (const playerSocket of this.network.playerSockets) {
      this.players.push(
        new Player(playerSocket.data.playerNum as 1 | 2, this, {
          io: this.network.io,
          socket: playerSocket,
        })
      );
    }
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
    this.getPlayer(this.activePlayer).turn++;

    updateActivePlayer(this.network, this);
    updatePriority(this.network, this);
    this.handlePhaseChange();
  }

  nextPhase() {
    const nextIndex =
      (PhasesArray.findIndex((phase) => phase === this.currentPhase) + 1) %
      (PhasesArray.length - 1);

    this.priorityPassNum = 0;

    if (nextIndex === 0) {
      this.getPlayer(this.activePlayer).landsCasted = 0;

      this.activePlayer = (this.activePlayer ^ 3) as 1 | 2;
      this.getPlayer(this.activePlayer).turn++;

      this.declaredAttackers = false;
      this.declaredBlockers = false;

      updateActivePlayer(this.network, this);
    }

    this.priority = this.activePlayer;
    this.currentPhase = PhasesArray[nextIndex];

    if (this.priority) updatePriority(this.network, this);

    this.handlePhaseChange();
  }

  handlePhaseChange() {
    const player = this.getPlayer(this.activePlayer);

    switch (this.currentPhase) {
      case "BEGINNING_UNTAP":
        player.unTapCards();
        player.removeSummoningSickness();
        updateBoard(this.network, this);
        this.nextPhase();
        break;
      case "BEGINNING_DRAW":
        if (player.turn !== 1) player.drawCard();
        updateBoard(this.network, this);
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
        this.nextPhase();
        break;
      case "CLEANUP":
        break;
    }
  }

  getPlayer(playerNum: number) {
    const player = this.players.find(
      (player) => player.playerNum === playerNum
    );

    if (!player) throw new Error(`Player not found for ${playerNum}`);

    return player;
  }
}

export default Game;
