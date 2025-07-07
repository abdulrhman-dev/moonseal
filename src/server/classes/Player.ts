import type { IO, ServerSocket } from "../types/socket";
import { type Card as CardType, Card } from "./Card";
import { CardCollection } from "./CardCollection";
import Mana from "./Mana";
import Game from "./Game";
import { updateBoard, updatePlayerList } from "../socket/handleGame";

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

    for (const land of this.battlefield.lands) {
      if (manaCost.empty || manaCost.invalid) break;
      if (land.tapped) continue;

      const landMana = land.getManaGiven();

      if (manaCost.shareTypes(landMana)) {
        land.tapCard();
        manaCost.sub(landMana);
        this.addManaPool(landMana);
      }
    }
    updateBoard(this.gameRef);
  }

  addManaPool(mana: Mana) {
    this.manaPool.add(mana);

    updatePlayerList(this.network.socket, this, "hand");
  }

  spendMana(mana: Mana) {
    if (this.manaPool.canFit(mana)) {
      this.manaPool.sub(mana);
      return;
    }
    const neededManaCost = new Mana(mana).sub(this.manaPool).normalize();
    this.getManaFromLands(neededManaCost);
    this.manaPool.sub(mana);

    if (this.manaPool.invalid)
      throw new Error(`Invalid mana pool after spending, ${this.manaPool}`);
  }

  castSpell(cardId: number) {
    const card = this.hand.search(cardId);

    if (!card) throw new Error("Card not found");

    if (!card.canCast(this.gameRef)) return;

    this.spendMana(card.getManaCost());
    this.hand.remove(card.id);

    if (card.data.type === "creature") {
      this.battlefield.creatures.add(card);
    } else if (card.data.type === "land") {
      this.battlefield.lands.add(card);
    }

    updateBoard(this.gameRef);
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
}
