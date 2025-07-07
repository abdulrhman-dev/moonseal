import type { CardResolveArgs, CardState } from "../types/cards";
import Game from "./Game";
import type { Card } from "./Card";
import type { TriggerNames } from "../types/triggers";
import { updateBoard, updatePriority } from "../socket/handleGame";
import type { ClientStack } from "@/features/GameSlice";

export type StackCardTypeProp =
  | { name: "CAST" }
  | { name: "SHOWCASE" }
  | {
      name: "TRIGGER";
      triggerName: TriggerNames;
    }
  | {
      name: "ACTIVITED";
      activitedNum: number;
    };

export type StackCard = {
  data: Card;
  args: CardResolveArgs;
  type: StackCardTypeProp;
};

class Stack {
  gameRef: Game;
  cards: StackCard[] = [];

  constructor(gameRef: Game) {
    this.gameRef = gameRef;
  }

  push(card: StackCard) {
    if (!card.data.canCast(this.gameRef)) return;

    const player = this.gameRef.getPlayer(card.data.cardPlayer);
    player.spendMana(card.data.getManaCost());

    this.cards.push(card);

    if (card.type.name !== "SHOWCASE") {
      this.gameRef.priorityPassNum = 0;
      this.gameRef
        .getPlayer(card.data.cardPlayer)
        .battlefield.creatures.remove(card.data.id);
      updatePriority(this.gameRef);
    }

    if (!this.gameRef.getPlayer(card.data.cardPlayer ^ 3).checkNeedPriority()) {
      this.resolveTop();
    }

    updateBoard(this.gameRef);
  }

  resolveTop() {
    if (!this.cards.length) return;
    const stackTop = this.cards[this.cards.length - 1];

    if (stackTop.type.name !== "SHOWCASE") {
      this.handleCardResolution(stackTop);

      this.gameRef.priorityPassNum = 0;
      this.gameRef.priority = this.gameRef.activePlayer;
      updatePriority(this.gameRef);
    }

    this.cards.pop();
    updateBoard(this.gameRef);
  }

  handleCardResolution(stackTop: StackCard) {
    if (stackTop.type.name === "CAST") {
      // TODO: HANDLE ADDING/REMOVING Stack Cards
      this.gameRef.getPlayer(stackTop.data.cardPlayer).castSpell(stackTop.data);
    }

    if (stackTop.type.name === "ACTIVITED") return;
  }

  toClientStack(): ClientStack[] {
    const cards: ClientStack[] = [];

    for (const stackCard of this.cards) {
      const card = stackCard.data;

      cards.push({
        data: {
          id: card.id,
          type: card.data.type,
          name: card.data.name,
          enchanters: [],
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
          canCast: card.canCast(this.gameRef),
        },
        type: stackCard.type.name === "CAST" ? "CAST" : "ABILITY",
      });
    }

    return cards;
  }
}

export default Stack;
