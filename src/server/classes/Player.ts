import type { Card } from "./Card";
import { CardCollection } from "./CardCollection";
import Mana from "./Mana";

export type Deck = {
  id: string;
  name: string;
  amount: number;
}[];

export default class Player {
  playerNum: 1 | 2;
  library: CardCollection = new CardCollection();
  graveyard: CardCollection = new CardCollection();
  exile: CardCollection = new CardCollection();
  hand: CardCollection = new CardCollection();
  battlefield: {
    creatures: CardCollection;
    lands: CardCollection;
  } = {
    creatures: new CardCollection(),
    lands: new CardCollection(),
  };
  manaPool: Mana = new Mana({});
  life: number = 0;
  turn: number = 0;
  landsCasted: number = 0;
  ready: boolean = false;

  constructor(playerNum: 1 | 2) {
    this.playerNum = playerNum;
  }

  get maxManaPool() {
    const accMana = new Mana();

    for (const land of this.battlefield.lands) {
      accMana.add(land.getManaGiven(this));
    }

    return accMana;
  }

  async initializeLibrary(deck: Deck) {
    for (const deckCard of deck) {
      const cardImport = await import(
        `../cards/card_${deckCard.id}_${deckCard.name}`
      );

      const card = cardImport.default as Card;

      let count = deckCard.amount;

      card.cardPlayer = this.playerNum;

      while (count--) this.library.add(card);
    }

    this.library.shuffle();
  }

  getManaFromLands(mana: Mana) {
    const manaCost = new Mana(mana);

    for (const land of this.battlefield.lands) {
      if (land.tapped) return;
      if (manaCost.empty || manaCost.invalid) return;

      const landMana = land.getManaCost();

      if (manaCost.shareTypes(landMana)) {
        this.manaPool.add(landMana);
        manaCost.sub(landMana);
      }
    }
  }

  removeSummoningSickness() {
    for (const creature of this.battlefield.creatures)
      creature.summoningSickness = false;
  }

  unTapCards() {
    for (const creature of this.battlefield.creatures) creature.unTapCard();
    for (const land of this.battlefield.lands) land.unTapCard();
  }

  drawCard() {
    this.hand.add(this.library.draw());
  }
}
