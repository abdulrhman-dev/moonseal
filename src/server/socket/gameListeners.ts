import type { ClientToServerEvents } from "@backend/types/socket";
import { updateFights, updatePriority } from "./handleGame";
import type Game from "@backend/classes/Game";
import type { GameFight } from "@backend/classes/Game";
import type { Card } from "@backend/classes/Card";

export const gameListeners: (keyof ClientToServerEvents)[] = [
  "cast-spell:action",
  "next-phase:action",
  "set-declared-attackers:action",
  "set-declared-blockers:action",
  "toggle-attacker:action",
  "toggle-blocker:action",
  "turn-skip:action",
  "assign-damage:action",
];

export const registerGameListeners = (game: Game) => {
  const playerSockets = game.network.playerSockets;

  for (const playerSocket of playerSockets) {
    playerSocket.on("next-phase:action", () => {
      game.passPriority();
      updatePriority(game);
    });

    playerSocket.on("cast-spell:action", ({ id, args, type }) => {
      if (playerSocket.data.playerNum !== game.priority) return;
      const card = game.getPlayer(playerSocket.data.playerNum).findCard(id);

      if (!card) throw new Error("Couldn't find the card on stack");

      if (card.data.type === "land") {
        game.getPlayer(playerSocket.data.playerNum).landsCasted++;
        game.getPlayer(playerSocket.data.playerNum).castSpell(card, args);
        return;
      }

      if (type.name === "CAST") {
        const player = game.getPlayer(card.cardPlayer);
        player.spendMana(card.getManaCost());
      }

      game.stack.push({
        args,
        type,
        data: card,
      });
    });

    playerSocket.on("set-declared-attackers:action", () => {
      console.log("RECEIVED");
      game.declaredAttackers = true;
      updateFights(game);
    });

    playerSocket.on("set-declared-blockers:action", () => {
      game.declaredBlockers = true;
      updateFights(game);
    });

    playerSocket.on("toggle-attacker:action", ({ attackerId }) => {
      game.toggleAttacker(attackerId);
      updateFights(game);
    });

    playerSocket.on("toggle-blocker:action", ({ blockerId, attackerId }) => {
      game.toggleBlocker(blockerId, attackerId);
      updateFights(game);
    });

    playerSocket.on(
      "turn-skip:action",
      ({ autoResolvePriority, autoPassPriority }) => {
        const player = game.getPlayer(playerSocket.data.playerNum);
        player.autoPassPriority = autoPassPriority;
        player.autoResolvePriority = autoResolvePriority;
        console.log("AUTO PASS: ", player.autoPassPriority);
      }
    );

    playerSocket.on("assign-damage:action", (fights) => {
      const gameFights: GameFight[] = [];

      for (const fight of fights) {
        const attackerCard = game.findCard(fight.attacker);

        if (!attackerCard)
          throw new Error("Attacker not found for server fight");

        const fightBlockers: { card: Card; damage: number }[] = [];

        for (const blocker of fight.blockers) {
          const blockerCard = game.findCard(blocker.id);

          if (!blockerCard)
            throw new Error("Blocker not found for server fight");

          fightBlockers.push({ card: blockerCard, damage: blocker.damage });
        }

        gameFights.push({
          attacker: attackerCard,
          blockers: fightBlockers,
        });
      }

      game.fights = gameFights;
      game.declaredAssignDamage = true;
      updateFights(game);
      game.handleCombatDamagePhase();
    });
  }
};
