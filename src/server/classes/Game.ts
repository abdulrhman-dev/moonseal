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

type GameFight = {
  attacker: Card;
  blockers: Card[];
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
      await delay(200);
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
        await delay(200);
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
      fight.blockers.map((blocker) => blocker.id).includes(blockerId)
    );

    if (fight) {
      fight.blockers = fight.blockers.filter(
        (blocker) => blocker.id !== blockerId
      );
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

    newFight.blockers.push(blockerCard);
  }

  handleCombat() {
    if (this.flags.preventDamage) return;

    for (const fight of this.fights) {
      const attacker = fight.attacker;

      if (!fight.blockers.length) {
        this.getPlayer(this.activePlayer ^ 3).life -= attacker.power;
        continue;
      }

      for (const blocker of fight.blockers) {
        const blockerToughness = blocker.toughness;

        blocker.toughness -= attacker.power;
        attacker.toughness -= blocker.power;

        attacker.power = Math.max(attacker.power - blockerToughness, 0);
      }

      attacker.power = attacker.data.defaultPower;
    }
  }

  cleanUpCombat() {
    this.fights = [];
    updateBoard(this);
    updateFights(this);
    updatePlayer(this, 1);
    updatePlayer(this, 2);
  }

  cleanupDeadCreatures() {
    for (const player of this.players) {
      const deadCreatures: number[] = [];

      for (const creature of player.battlefield.creatures) {
        // Handle lethal damage
        if (creature.toughness <= 0) {
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
        creature.power = creature.data.defaultPower;
        creature.toughness = creature.data.defaultToughness;
      }
    }

    updateBoard(this);
  }

  getClientFights(): Fight[] {
    return this.fights.map((fight) => ({
      attacker: fight.attacker.id,
      blockers: fight.blockers.map((blocker) => blocker.id),
    }));
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
        this.handleCombat();
        this.cleanUpCombat();
        this.cleanupDeadCreatures();
        updatePriority(this);
        this.nextPhase();
        break;
      case "CLEANUP":
        this.healCreatures();
        this.clearFlags();
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

  findCard(cardId: number) {
    for (const player of this.players) {
      const card = player.findCard(cardId);

      if (card) return card;
    }
  }
}

export default Game;
