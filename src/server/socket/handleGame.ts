import type Player from "../classes/Player";
import Game, { type GameFight } from "../classes/Game";
import type { ClientToServerEvents, IO, ServerSocket } from "../types/socket";
import type { InitilizeTargetingArgs, Target } from "@/features/TargetingSlice";
import type { TargetData } from "@backend/types/cards";
import type { Card } from "@backend/classes/Card";
import { registerGameListeners } from "./gameListeners";

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
  // handleGameMulligan(playerSockets, game);
  game.startGame();
  registerGameListeners(game);
}

export const getTargets = (
  socket: ServerSocket,
  data: InitilizeTargetingArgs
): Promise<Target[]> => {
  return new Promise((resolve) => {
    socket.emit("targeting:change", data);
    socket.once("send-targets:action", (targets: Target[]) => {
      resolve(targets);
    });
  });
};

const handleGameMulligan = (playerSockets: ServerSocket[], game: Game) => {
  for (const playerSocket of playerSockets) {
    let mulliganCount = 0;
    playerSocket.on("mulligan:action", async () => {
      const player = game.getPlayer(playerSocket.data.playerNum);

      for (const card of player.hand) {
        player.library.add(card);
        player.hand.remove(card.id);
      }

      for (let i = 0; i < 7; ++i) player.drawCard();

      mulliganCount++;

      updatePlayerList(playerSocket, player, "hand");

      if (mulliganCount === 7) {
        handleDiscardCards(playerSocket, player, mulliganCount);
        playerSocket.removeAllListeners("mulligan:action");
      }
    });

    playerSocket.on("set-ready:action", async () => {
      const player = game.getPlayer(playerSocket.data.playerNum);
      handleDiscardCards(playerSocket, player, mulliganCount);
      playerSocket.removeAllListeners("set-ready:action");
    });
  }
};

async function handleDiscardCards(
  playerSocket: ServerSocket,
  player: Player,
  mulliganCount: number
) {
  if (mulliganCount > 0) {
    const discardHandRule: TargetData = {
      targetSelects: [
        {
          amount: mulliganCount,
          player: 1,
          type: "all",
          location: "hand",
        },
      ],
      text: "",
      type: "AND",
    };

    const targets = await getTargets(playerSocket, {
      data: discardHandRule,
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
  }

  player.ready = true;

  const opponenetReady = player.gameRef.getPlayer(player.playerNum ^ 3).ready;

  if (opponenetReady) {
    updateBoard(player.gameRef);
    updatePlayer(player.gameRef, player.playerNum);
    updatePlayer(player.gameRef, player.playerNum ^ 3);
    registerGameListeners(player.gameRef);
    player.gameRef.startGame();
    return true;
  }

  return false;
}

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
        creatures: creatures.toCardState(game, false),
        lands: lands.toCardState(game, false),
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
    declaredDamageAssign: game.declaredAssignDamage,
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
