import type Player from "../classes/Player";
import Game from "../classes/Game";
import type { ClientToServerEvents, IO, ServerSocket } from "../types/socket";

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

  for (const playerSocket of playerSockets) {
    playerSocket.join("game");
    updateLists(io, playerSocket, game, "hand");
  }

  game.startGame();
  registerGameListeners(io, playerSockets, game);
}
export const listeners: (keyof ClientToServerEvents)[] = [
  "cast-spell:action",
  "next-phase:action",
];
const registerGameListeners = (
  io: IO,
  playerSockets: ServerSocket[],
  game: Game
) => {
  for (const playerSocket of playerSockets) {
    playerSocket.on("next-phase:action", () => {
      game.nextPhase();
    });

    playerSocket.on("cast-spell:action", ({ id }) => {
      if (playerSocket.data.playerNum !== game.priority) return;

      game.getPlayer(playerSocket.data.playerNum).castSpell(id);
    });
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

export function updateBoard(network: GameNetwork, game: Game) {
  let num = 0;
  for (const playerSocket of network.playerSockets) {
    updateLists(network.io, playerSocket, game, "hand");
    updateLists(network.io, playerSocket, game, "battlefield");
    num++;
  }
}

export function updatePriority(network: GameNetwork, game: Game) {
  for (const playerSocket of network.playerSockets) {
    playerSocket.emit("priority:change", {
      phase: game.currentPhase,
      priority: playerSocket.data.playerNum === game.priority ? 1 : 2,
    });
    updateLists(game.network.io, playerSocket, game, "hand");
  }
}

export function updateActivePlayer(network: GameNetwork, game: Game) {
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
