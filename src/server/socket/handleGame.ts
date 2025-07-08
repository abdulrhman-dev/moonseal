import type Player from "../classes/Player";
import Game from "../classes/Game";
import type { ClientToServerEvents, IO, ServerSocket } from "../types/socket";

export default async function registerHandleGame(
  io: IO,
  playerSockets: ServerSocket[]
) {
  console.log("STARTED GAME");
  const game = new Game(io, playerSockets);
  await game.initlizeDecks();

  for (let i = 0; i < 7; ++i) {
    game.players[0].drawCard();
    game.players[1].drawCard();
  }

  for (const playerSocket of playerSockets) {
    playerSocket.join("game");
    updateLists(io, playerSocket, game, "hand");
  }

  game.startGame();
  registerGameListeners(game);
}
export const listeners: (keyof ClientToServerEvents)[] = [
  "cast-spell:action",
  "next-phase:action",
  "set-declared-attackers:action",
  "set-declared-blockers:action",
  "toggle-attacker:action",
  "toggle-blocker:action",
];

const registerGameListeners = (game: Game) => {
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
  }
};

type listNames = "hand" | "exile" | "graveyard" | "battlefield";

export function updateLists(
  io: IO,
  playerSocket: ServerSocket,
  game: Game,
  listName: listNames
) {
  const playerNum = playerSocket.data.playerNum;

  if (listName === "battlefield") {
    const currentPlayer = game.getPlayer(playerNum);
    const opposingPlayer = game.getPlayer(playerNum ^ 3);

    const { creatures, lands } = currentPlayer.battlefield;

    currentPlayer.network.socket.emit("list:change", {
      type: "player",
      listName: "battlefield",
      list: {
        creatures: creatures.toCardState(game),
        lands: lands.toCardState(game),
      },
    });

    opposingPlayer.network.socket.emit("list:change", {
      type: "opposing",
      listName: "battlefield",
      list: {
        creatures: creatures.toCardState(game),
        lands: lands.toCardState(game),
      },
    });
    return;
  }

  if (!playerSocket) return;

  playerSocket.emit("list:change", {
    type: "player",
    listName: "hand",
    list: game.getPlayer(playerNum)[listName].toCardState(game),
  });

  playerSocket.emit("list:change", {
    type: "opposing",
    listName: "hand",
    list: game.getPlayer(playerNum ^ 3)[listName].toEmptyCardList(),
  });
}

export function updatePlayerList(
  socket: ServerSocket,
  player: Player,
  listName: listNames
) {
  if (listName !== "battlefield") {
    socket.emit("list:change", {
      type: "player",
      listName,
      list: player[listName].toCardState(player.gameRef),
    });
  }
}

export function updateBoard(game: Game) {
  const network = game.network;
  for (const playerSocket of network.playerSockets) {
    updateLists(network.io, playerSocket, game, "hand");
    updateLists(network.io, playerSocket, game, "battlefield");
  }
  network.io.to("game").emit("list:change", {
    listName: "stack",
    list: game.stack.toClientStack(),
  });
}

export function updatePriority(game: Game) {
  const network = game.network;
  for (const playerSocket of network.playerSockets) {
    playerSocket.emit("priority:change", {
      phase: game.currentPhase,
      priority: playerSocket.data.playerNum === game.priority ? 1 : 2,
    });
    updateLists(game.network.io, playerSocket, game, "hand");
  }
}

export function updateActivePlayer(game: Game) {
  const network = game.network;

  for (const playerSocket of network.playerSockets) {
    console.log(
      "ACTIVE PLAYER: ",
      game.activePlayer,
      " PLAYER NUMBER: ",
      playerSocket.data.playerNum,
      playerSocket.id
    );
    playerSocket.emit("active-player:change", {
      activePlayer: playerSocket.data.playerNum === game.activePlayer,
    });
  }
}

export function updateFights(game: Game) {
  const network = game.network;

  network.io.to("game").emit("fight:change", {
    fights: game.getClientFights(),
    declaredAttackers: game.declaredAttackers,
    declaredBlockers: game.declaredBlockers,
  });
}

export function updatePlayer(game: Game, playerNum: number) {
  for (const playerSocket of game.network.playerSockets) {
    if (playerSocket.data.playerNum === playerNum) {
      const player = game.getPlayer(playerNum);
      const opponent = game.getPlayer(playerNum ^ 3);

      playerSocket.emit("player:change", {
        player: {
          life: player.life,
          ready: player.ready,
          mana: player.manaPool.toClientState(),
        },
        opponenet: {
          life: opponent.life,
          ready: opponent.ready,
        },
      });
    }
  }
}
