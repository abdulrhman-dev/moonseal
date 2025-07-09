import Mana from "../classes/Mana";
import { Card, type CardResolveServerArgs } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "../classes/Player";
import {
  getTargets,
  updateBoard,
  updatePlayerList,
} from "../socket/handleGame";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player): void {
    for (let i = 0; i < 3; ++i) {
      const card = player.library.draw();
      if (!card) break;
      player.lookup.add(card);
    }

    updatePlayerList(player.network.socket, player, "lookup");

    getTargets(player.network.socket, {
      data: {
        targetSelects: [
          {
            amount: 1,
            location: "lookup",
            player: 1,
            type: "land",
          },
          {
            amount: 1,
            location: "lookup",
            player: 1,
            type: "creature",
          },
        ],
        text: "",
        type: "OR",
      },
      mode: "auto",
      canCancel: true,
    }).then((targets) => {
      const targetIds = targets.map((target) => target.data.id);

      for (const card of player.lookup) {
        if (targetIds.includes(card.id)) {
          player.hand.add(card);
        } else {
          player.library.add(card, true);
        }
        player.lookup.remove(card.id);
      }

      updatePlayerList(player.network.socket, player, "lookup");
      updateBoard(player.gameRef);
    });
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 212713,
      name: "Adventurous Impulse",
      type: "sorcery",
      typeLine: "Sorcery",
      text: "Look at the top three cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
      summoningSickness: false,
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({
        green: 0,
        colorless: 0,
      }),
      keywords: [],
    },
    game
  );

  return card;
}
