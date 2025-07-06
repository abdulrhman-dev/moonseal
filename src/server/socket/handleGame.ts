import type { Phases } from "@backend/types/phases";
import Game from "../classes/Game";
import type { IO, ServerSocket } from "../types/socket";

type GameNetwork = { io: IO; playerSockets: ServerSocket[] };

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

  let num = 0;

  for (const playerSocket of playerSockets) {
    playerSocket.join("game");
    updateLists(io, game, "hand", num++, playerSocket);
  }
  game.startGame();
  // registerGameListeners(io, playerSockets, game);
}

const registerGameListeners = (
  io: IO,
  playerSockets: ServerSocket[],
  game: Game
) => {
  for (const playerSocket of playerSockets) {
    playerSocket.on("next-phase:action", () => {
      game.nextPhase();
    });
  }
};

type listNames = "hand" | "exile" | "graveyard" | "battlefield";

function updateLists(
  io: IO,
  game: Game,
  listName: listNames,
  playerNum: number,
  playerSocket?: ServerSocket
) {
  if (listName === "battlefield") {
    const { creatures, lands } = game.players[playerNum - 1].battlefield;
    io.emit("list:change", {
      type: "player",
      listName: "battlefield",
      list: { creatures: creatures.toCardState(), lands: lands.toCardState() },
    });
    return;
  }

  if (!playerSocket) return;

  playerSocket.emit("list:change", {
    type: "player",
    listName: "hand",
    list: game.players[playerNum][listName].toCardState(),
  });

  playerSocket.emit("list:change", {
    type: "opposing",
    listName: "hand",
    list: game.players[(playerNum + 1) % 2][listName].toEmptyCardList(),
  });
}

export function updateBoard(network: GameNetwork, game: Game) {
  let num = 0;
  for (const playerSocket of network.playerSockets) {
    updateLists(network.io, game, "hand", num, playerSocket);
    num++;
  }

  updateLists(network.io, game, "battlefield", num);
}

export function updatePriority(network: GameNetwork, game: Game) {
  let num = 0;
  for (const playerSocket of network.playerSockets) {
    // console.log(num + 1, game.priority, "PRIORITY");
    playerSocket.emit("priority:change", {
      phase: game.currentPhase,
      priority: playerSocket.data.playerNum === game.priority ? 1 : 2,
    });
    num++;
  }
}

export function updateActivePlayer(network: GameNetwork, game: Game) {
  for (const playerSocket of network.playerSockets) {
    console.log(playerSocket.data.playerNum, game.activePlayer, "ACTIVE");
    playerSocket.emit("active-player:change", {
      activePlayer: playerSocket.data.playerNum === game.activePlayer,
    });
  }
}
