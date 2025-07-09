import Mana from "../classes/Mana";
import { Card } from "../classes/Card";
import type Game from "../classes/Game";
import type Player from "@backend/classes/Player";

class CardCreator extends Card {
  cast() {}

  resolve(player: Player): void {
    const powers = player.battlefield.creatures.collection.map(
      (creature) => creature.totalPower
    );
    const x = Math.max(...powers);

    for (const creature of player.battlefield.creatures) {
      creature.tempModifiedPower += x;
      creature.tempModifiedToughness += x;
      creature.tempKeywords.push("Trample");
    }
  }
}

export default function (game: Game) {
  const card = new CardCreator(
    {
      gameId: 577825,
      name: "Overwhelming Stampede",
      type: "sorcery",
      typeLine: "Sorcery",
      text: "Until end of turn, creatures you control gain trample and get +X/+X, where X is the greatest power among creatures you control.",
      summoningSickness: false,
      defaultPower: 0,
      defaultToughness: 0,
      manaCost: new Mana({
        green: 2,
        colorless: 3,
      }),
      keywords: [],
    },
    game
  );

  return card;
}
