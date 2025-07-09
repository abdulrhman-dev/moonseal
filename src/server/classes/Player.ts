import type { IO, ServerSocket } from "../types/socket";
import {
  type CardResolveServerArgs,
  type Card as CardType,
  Card,
} from "./Card";
import { CardCollection } from "./CardCollection";
import Mana from "./Mana";
import Game from "./Game";
import {
  updateBoard,
  updatePlayer,
  updatePlayerList,
} from "../socket/handleGame";
import type { CardResolveArgs, CardState } from "@backend/types/cards";

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
  lookup: CardCollection = new CardCollection();
  battlefield: {
    creatures: CardCollection;
    lands: CardCollection;
  } = {
    creatures: new CardCollection(),
    lands: new CardCollection(),
  };
  manaPool: Mana = new Mana({ green: 200 });
  life: number = 20;
  turn: number = 0;
  landsCasted: number = 0;
  ready: boolean = false;
  autoPassPriority: boolean = false;
  autoResolvePriority: boolean = false;
  network: {
    io: IO;
    socket: ServerSocket;
  };
  gameRef: Game;

  constructor(
    playerNum: 1 | 2,
    game: Game,
    network: { io: IO; socket: ServerSocket }
  ) {
    this.playerNum = playerNum;
    this.network = network;
    this.gameRef = game;
  }

  get maxManaPool() {
    const accMana = new Mana();

    accMana.add(this.manaPool);

    for (const land of this.battlefield.lands) {
      if (land.tapped) continue;
      accMana.add(land.getManaGiven());
    }

    return accMana;
  }

  async initializeLibrary(deck: Deck) {
    for (const deckCard of deck) {
      const cardImport = await import(
        `../cards/card_${deckCard.id}_${deckCard.name}`
      );

      const cardCreator = cardImport.default as () => CardType;
      let count = deckCard.amount;

      while (count--) {
        const card = cardCreator();
        card.cardPlayer = this.playerNum;
        this.library.add(card);
      }
    }

    this.library.shuffle();
  }

  getManaFromLands(mana: Mana) {
    const manaCost = new Mana(mana);
    console.log("NEEDED", manaCost);
    for (const land of this.battlefield.lands) {
      console.log("MANA COST UPDATE: ", manaCost);
      if (manaCost.empty || manaCost.invalid) break;
      if (land.tapped) continue;

      const landMana = land.getManaGiven();
      console.log("LAND MANA: ", landMana);

      if (manaCost.shareTypes(landMana)) {
        land.tapCard();
        manaCost.sub(landMana, true);
        this.addManaPool(landMana);
      }
    }
    updateBoard(this.gameRef);
  }

  addManaPool(mana: Mana) {
    this.manaPool.add(mana);

    updatePlayerList(this.network.socket, this, "hand");

    updatePlayer(this.gameRef, this.playerNum);
  }

  spendMana(mana: Mana) {
    if (this.manaPool.canFit(mana)) {
      this.manaPool.sub(mana);
      return;
    }

    const neededManaCost = new Mana(mana).sub(this.manaPool).normalize();
    this.getManaFromLands(neededManaCost);
    this.manaPool.sub(mana);

    if (this.manaPool.invalid) {
      console.log(mana);
      console.log(this.manaPool);

      throw new Error(`Invalid mana pool after spending, ${this.manaPool}`);
    }

    updatePlayer(this.gameRef, this.playerNum);
  }

  castSpell(card: Card, args: CardResolveArgs) {
    if (this.hand.search(card.id)) {
      this.hand.remove(card.id);
    }

    switch (card.data.type) {
      case "creature":
        this.battlefield.creatures.add(card);
        break;
      case "land":
        this.battlefield.lands.add(card);
        break;
    }

    card.resolve(this, { targets: this.getTargetCards(args.targets) });

    updateBoard(this.gameRef);
  }

  getTargetCards(targets?: CardState[][]): Card[][] {
    if (!targets) return [];
    const cardTargets: Card[][] = [];
    for (const targetData of targets) {
      const targetLevel = [];

      for (const target of targetData) {
        const card = this.gameRef.findCard(target.id);
        if (!card) throw new Error("Can't find Target Card");
        targetLevel.push(card);
      }

      cardTargets.push(targetLevel);
    }
    console.log(
      "TARGETS: ",
      cardTargets.map((cardTarget) => cardTarget.map((target) => target.id))
    );

    return cardTargets;
  }

  removeSummoningSickness() {
    for (const creature of this.battlefield.creatures)
      creature.data.summoningSickness = false;
  }

  unTapCards() {
    for (const creature of this.battlefield.creatures) creature.unTapCard();
    for (const land of this.battlefield.lands) land.unTapCard();
  }

  drawCard() {
    const card = this.library.draw();
    if (card) this.hand.add(card);
  }

  findCard(cardId: number) {
    for (const location of ["hand", "exile", "graveyard", "library"] as const) {
      let card = this[location].search(cardId);
      if (card) return card;
    }

    for (const location of ["creatures", "lands"] as const) {
      let card = this.battlefield[location].search(cardId);
      if (card) return card;
    }
  }

  checkNeedPriority() {
    if (this.autoPassPriority) return false;

    for (const card of this.hand) {
      if (card.canCast(this.gameRef)) {
        console.log("PASS CARD APPROVED", card.data.name);
        return true;
      }
    }

    return false;
  }

  checkCanAttack() {
    return this.battlefield.creatures.collection.reduce(
      (prev, card) => prev || (!card.tapped && !card.data.summoningSickness),
      false
    );
  }

  checkCanBlock() {
    return (
      this.gameRef.fights.length &&
      this.battlefield.creatures.collection.reduce(
        (prev, card) => prev || !card.tapped,
        false
      )
    );
  }
}
