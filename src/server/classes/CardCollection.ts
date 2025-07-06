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

  [Symbol.iterator]() {
    return this.collection.values();
  }
}
