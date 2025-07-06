import type { CardState } from "@backend/types/cards";
import { Card } from "./Card";
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

  toCardState(): CardState[] {
    const cards: CardState[] = [];

    for (const card of this.collection) {
      cards.push({
        id: card.id,
        type: card.data.type,
        name: card.data.name,
        enchanters: [],
        targets: [],
        targetData: card.targetData,
        summoningSickness: card.summoningSickness,
        power: card.power,
        toughness: card.toughness,
        defaultPower: card.data.defaultPower,
        defaultToughness: card.data.defaultToughness,
        cardPlayer: card.cardPlayer,
        gameId: card.data.gameId,
        tapped: card.tapped,
        text: card.data.text,
        typeLine: card.data.typeLine,
      });
    }

    return cards;
  }

  toEmptyCardList(): CardState[] {
    return Array(this.collection.length).fill({
      id: 0,
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
      tapped: 0,
      text: "",
      typeLine: "",
    });
  }

  [Symbol.iterator]() {
    return this.collection.values();
  }
}
