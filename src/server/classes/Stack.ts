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
    console.log("STACK ADD: ", card.type.name, card.data.data.name);

    // removing showcase cards if there's any
    if (this.cards.length) {
      const stackTop = this.cards[this.cards.length - 1];

      if (stackTop.type.name === "SHOWCASE") this.resolveTop();
    }

    this.cards.push(card);

    if (card.type.name !== "SHOWCASE") {
      this.gameRef.priorityPassNum = 0;
      this.gameRef
        .getPlayer(card.data.cardPlayer)
        .battlefield.creatures.remove(card.data.id);
      updatePriority(this.gameRef);

      if (
        !this.gameRef.getPlayer(card.data.cardPlayer ^ 3).checkNeedPriority()
      ) {
        this.resolveTop();
      }
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
      this.gameRef
        .getPlayer(stackTop.data.cardPlayer)
        .castSpell(stackTop.data, stackTop.args);
    }

    if (stackTop.type.name === "ACTIVITED") return;
  }

  toClientStack(): ClientStack[] {
    const cards: ClientStack[] = [];

    for (const stackCard of this.cards) {
      const card = stackCard.data;

      const targetsAcc: number[] = [];

      if (stackCard.args.targets) {
        for (const targetLevel of stackCard.args.targets) {
          for (const target of targetLevel) {
            targetsAcc.push(target.id);
          }
        }
      }

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
        type:
          stackCard.type.name === "ACTIVITED" ||
          stackCard.type.name === "TRIGGER"
            ? "ABILITY"
            : stackCard.type.name,
        targets: targetsAcc,
      });
    }

    return cards;
  }
}

export default Stack;
