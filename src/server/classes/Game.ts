import Player from "./Player";
import type { Phases } from "../types/phases";

import { decks } from "../deck";
import type { IO, ServerSocket } from "../types/socket";
import {
  getTargets,
  updateActivePlayer,
  updateBoard,
  updateFights,
  updatePlayer,
  updatePriority,
} from "../socket/handleGame";
import type { Card } from "./Card";
import type { Fight } from "@/features/GameSlice";
import Stack from "./Stack";

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

export type GameFight = {
  attacker: Card;
  blockers: { card: Card; damage: number }[];
};
export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
class Game {
  players: Player[] = [];
  activePlayer: 0 | 1 | 2 = 0;
  priority: 0 | 1 | 2 = 0;
  priorityPassNum: number = 0;
  currentPhase: Phases = "NONE";
  fights: GameFight[] = [];
  stack: Stack;
  declaredAttackers: boolean = false;
  declaredBlockers: boolean = false;
  declaredAssignDamage: boolean = false;
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

    this.stack = new Stack(this);
  }

  async initlizeDecks() {
    for (const player of this.players) {
      console.log("PLAYER DECK CHOSEN:", player.network.socket.data.deckNumber);
      await player.initializeLibrary(
        decks[player.network.socket.data.deckNumber - 1]
      );
    }
  }

  clearFlags() {
    for (const key of Object.keys(this.flags) as (keyof typeof this.flags)[]) {
      this.flags[key] = false;
    }
  }

  startGame() {
    this.currentPhase = "BEGINNING_UNTAP";

    this.activePlayer = (Math.floor(Math.random() * 2) + 1) as 1 | 2;
    this.priority = this.activePlayer;
    this.getPlayer(this.activePlayer).turn++;

    updateActivePlayer(this);
    updatePriority(this);
    this.handlePhaseChange();
  }

  passPriority() {
    if (!this.priority) return;

    this.priorityPassNum++;
    this.priority = (this.priority ^ 3) as 1 | 2;

    this.handlePriorityChange();
  }

  async handlePriorityChange() {
    if (this.priorityPassNum > 2 && !this.stack.cards.length) {
      this.nextPhase();
      return;
    }

    if (this.priorityPassNum >= 2 && this.stack.cards.length) {
      updateBoard(this);
      await delay(600);
      this.stack.resolveTop();
      return;
    }

    if (
      this.getPlayer(this.priority).autoPassPriority &&
      this.priority !== this.activePlayer &&
      !this.stack.cards.length
    ) {
      this.nextPhase();
      return;
    }

    if (
      !this.getPlayer(this.priority).checkNeedPriority() &&
      this.priorityPassNum < 2
    ) {
      if (this.stack.cards.length) {
        updateBoard(this);
        await delay(600);
        this.stack.resolveTop();
      } else {
        this.nextPhase();
      }
      return;
    }
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
      this.declaredAssignDamage = false;

      updateActivePlayer(this);
      updateFights(this);
    }

    this.priority = this.activePlayer;
    this.currentPhase = PhasesArray[nextIndex];

    this.handlePhaseChange();
  }

  toggleAttacker(attackerId: number) {
    const prevAttacker = this.fights.find(
      (fight) => fight.attacker.id === attackerId
    );

    if (prevAttacker) {
      this.fights = this.fights.filter(
        (fight) => fight.attacker.id !== attackerId
      );

      prevAttacker.attacker.unTapCard();
      updateBoard(this);
      return;
    }

    const attackerCard = this.getPlayer(
      this.activePlayer
    ).battlefield.creatures.search(attackerId);

    if (!attackerCard) throw new Error("Attacker not found on battlefield");

    attackerCard.tapCard();
    // add attacker
    this.fights.push({
      attacker: attackerCard,
      blockers: [],
    });
    updateBoard(this);
  }

  toggleBlocker(blockerId: number, targetId: number) {
    const fight = this.fights.find((fight) =>
      fight.blockers.map((blocker) => blocker.card.id).includes(blockerId)
    );

    if (fight) {
      fight.blockers = fight.blockers.filter(
        (blocker) => blocker.card.id !== blockerId
      );
      console.log("REMOVING");
      return;
    }

    const newFight = this.fights.find(
      (fight) => fight.attacker.id === targetId
    );

    if (!newFight) return;

    const blockerCard = this.getPlayer(
      this.activePlayer ^ 3
    ).battlefield.creatures.search(blockerId);

    if (!blockerCard) {
      throw new Error("Blocker not found on battlefield");
    }

    newFight.blockers.push({
      card: blockerCard,
      damage: 0,
    });
  }

  handleCombat() {
    if (this.flags.preventDamage) return;

    const defendingPlayer = this.getPlayer(this.activePlayer ^ 3);

    for (const fight of this.fights) {
      const attacker = fight.attacker;

      if (!fight.blockers.length) {
        defendingPlayer.life -= attacker.totalPower;
        continue;
      }

      let lethalCount = 0;
      let totalDamage = attacker.totalPower;

      for (const blocker of fight.blockers) {
        blocker.card.damage += blocker.damage;
        attacker.damage += blocker.card.totalPower;

        if (blocker.card.totalToughness <= 0) lethalCount++;

        totalDamage -= blocker.damage;
      }

      if (attacker.keywords.includes("Trample")) {
        if (lethalCount === fight.blockers.length) {
          defendingPlayer.life -= totalDamage;
        }
      }
    }
  }

  cleanUpCombat() {
    this.fights = [];
    updateFights(this);
    this.cleanupDeadCreatures();
    updatePlayer(this, 1);
    updatePlayer(this, 2);
  }

  cleanupDeadCreatures() {
    for (const player of this.players) {
      const deadCreatures: number[] = [];

      for (const creature of player.battlefield.creatures) {
        // Handle lethal damage
        if (creature.totalToughness <= 0) {
          deadCreatures.push(creature.id);
        }
      }

      for (const deadCreatureId of deadCreatures)
        player.battlefield.creatures.remove(deadCreatureId);
    }

    updateBoard(this);
  }

  healCreatures() {
    for (const player of this.players) {
      for (const creature of player.battlefield.creatures) {
        creature.cleanup();
      }
    }

    updateBoard(this);
  }

  getClientFights(): Fight[] {
    return this.fights.map((fight) => ({
      attacker: fight.attacker.id,
      maxDamage: fight.attacker.totalPower,
      blockers: fight.blockers.map((blocker) => ({
        id: blocker.card.id,
        damage: blocker.damage,
      })),
    }));
  }

  initialDamgageDistribution() {
    for (const fight of this.fights) {
      let damage = fight.attacker.totalPower;

      for (const blocker of fight.blockers) {
        if (blocker.card.totalToughness <= damage) {
          blocker.damage = blocker.card.totalToughness;
          damage -= blocker.damage;
        } else {
          if (damage < 0) damage = 0;
          blocker.damage = damage;
          damage = 0;
        }
      }
    }
  }

  async handlePhaseChange() {
    const player = this.getPlayer(this.activePlayer);

    switch (this.currentPhase) {
      case "BEGINNING_UNTAP":
        player.unTapCards();
        player.removeSummoningSickness();
        updateBoard(this);
        this.nextPhase();
        break;
      case "BEGINNING_DRAW":
        if (player.turn !== 1) player.drawCard();
        updateBoard(this);
        this.nextPhase();
        updatePriority(this);
        break;
      case "BEGINNING_UNKEEP":
      case "COMBAT_BEGIN":
      case "COMBAT_END":
      case "END_STEP":
        this.nextPhase();
        break;
      case "COMBAT_ATTACK":
        if (!player.checkCanAttack()) this.declaredAttackers = true;
        updateFights(this);
        break;
      case "COMBAT_BLOCK":
        if (!this.getPlayer(this.activePlayer ^ 3).checkCanBlock())
          this.declaredBlockers = true;
        updateFights(this);
        break;
      case "COMBAT_DAMAGE":
        if (this.fights.length === 0) this.nextPhase();
        else {
          this.initialDamgageDistribution();
          updateFights(this);
        }
        break;
      case "CLEANUP":
        this.healCreatures();
        this.clearFlags();
        await this.handleCleanupDiscardCard(player);
        break;
    }
  }

  handleCombatDamagePhase() {
    this.handleCombat();
    this.cleanUpCombat();
    updatePriority(this);
  }

  async handleCleanupDiscardCard(player: Player) {
    if (player.hand.collection.length > 7) {
      const targets = await getTargets(player.network.socket, {
        data: {
          targetSelects: [
            {
              amount: player.hand.collection.length - 7,
              location: "hand",
              type: "all",
              player: 1,
            },
          ],
          text: "",
          type: "AND",
        },
        mode: "auto",
      });

      for (const target of targets) {
        const card = player.hand.search(target.data.id);
        if (!card) {
          throw new Error(
            `Target not found on server ${target.data.name} - ${target.data.id}`
          );
        }

        player.hand.remove(card.id);
        player.library.add(card);
      }

      player.library.shuffle();
      updatePlayer(this, player.playerNum);
      this.nextPhase();
    } else this.nextPhase();
  }

  getPlayer(playerNum: number) {
    const player = this.players.find(
      (player) => player.playerNum === playerNum
    );

    if (!player) throw new Error(`Player not found for ${playerNum}`);

    return player;
  }

  findCard(cardId: number) {
    for (const player of this.players) {
      const card = player.findCard(cardId);

      if (card) return card;
    }
  }
}

export default Game;
