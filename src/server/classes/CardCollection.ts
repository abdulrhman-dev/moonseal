import type { CardState } from "@backend/types/cards";
import { Card } from "./Card";
import type Game from "./Game";
export class CardCollection {
  collection: Card[] = [];

  search(id: number) {
    return this.collection.find((card) => card.id === id);
  }

  add(card: Card) {
    this.collection.push(card);
  }

  remove(id: number) {
    this.collection = this.collection.filter((card) => card.id !== id);
  }

  draw() {
    if (this.collection.length === 0) return;

    const collectionTop = this.collection[this.collection.length - 1];
    this.collection.pop();

    return collectionTop;
  }

  shuffle() {
    let i = this.collection.length;

    while (--i > 0) {
      const j = Math.floor(Math.random() * (i + 1));

      const temp = this.collection[j];
      this.collection[j] = this.collection[i];
      this.collection[i] = temp;
    }
  }

  toCardState(game: Game): CardState[] {
    const cards: CardState[] = [];

    for (const card of this.collection) {
      cards.push({
        id: card.id,
        type: card.data.type,
        name: card.data.name,
        enchanters: card.enchanters.toCardState(game),
        targets: [],
        targetData: card.targetData,
        summoningSickness: card.data.summoningSickness,
        power: card.power,
        toughness: card.toughness,
        defaultPower: card.data.defaultPower,
        defaultToughness: card.data.defaultToughness,
        cardPlayer: card.cardPlayer,
        gameId: card.data.gameId,
        tapped: card.tapped,
        text: card.data.text,
        typeLine: card.data.typeLine,
        canCast: card.cardPlayer === game.priority && card.canCast(game),
        activatedAbilities: card.getClientActivatedAbilities(game),
      });
    }

    return cards;
  }

  toEmptyCardList(): CardState[] {
    const cards: CardState[] = [];
    for (const card of this.collection) {
      cards.push({
        id: card.id,
        type: "instant",
        name: "",
        enchanters: [],
        targets: [],
        targetData: [],
        summoningSickness: false,
        power: 0,
        toughness: 0,
        defaultPower: 0,
        defaultToughness: 0,
        cardPlayer: 2,
        gameId: 0,
        tapped: false,
        text: "",
        typeLine: "",
        canCast: false,
        activatedAbilities: [],
      });
    }
    return cards;
  }

  [Symbol.iterator]() {
    return this.collection.values();
  }
}
