import type { CardResolveArgs, CardState } from "../types/cards";
import Game, { delay } from "./Game";
import type { Card } from "./Card";
import type { TriggerNames } from "../types/triggers";
import { updateBoard, updateLists, updatePriority } from "../socket/handleGame";
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

  async push(card: StackCard) {
    console.log("STACK ADD: ", card.type.name, card.data.data.name);

    // removing showcase cards if there's any
    if (this.cards.length) {
      const stackTop = this.cards[this.cards.length - 1];

      if (stackTop.type.name === "SHOWCASE") this.resolveTop();
    }

    if (card.type.name === "CAST") {
      const player = this.gameRef.getPlayer(card.data.cardPlayer);
      player.hand.remove(card.data.id);
    }

    this.cards.push(card);

    if (card.type.name !== "SHOWCASE") {
      this.gameRef.priorityPassNum = 0;
      if (
        !this.gameRef.getPlayer(card.data.cardPlayer ^ 3).checkNeedPriority()
      ) {
        updateBoard(this.gameRef);
        await delay(600);
        this.resolveTop();
      }

      updatePriority(this.gameRef);
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
      this.gameRef
        .getPlayer(stackTop.data.cardPlayer)
        .castSpell(stackTop.data, stackTop.args);
    }

    if (stackTop.type.name === "ACTIVITED") {
      const player = this.gameRef.getPlayer(stackTop.data.cardPlayer);
      stackTop.data.activateAbility(stackTop.type.activitedNum, player, {
        ...stackTop.args,
        targets: player.getTargetCards(stackTop.args.targets),
      });
    }
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
          power: card.totalPower,
          toughness: card.totalToughness,
          defaultPower: card.data.defaultPower,
          defaultToughness: card.data.defaultToughness,
          cardPlayer: card.cardPlayer,
          gameId: card.data.gameId,
          tapped: card.tapped,
          text: card.data.text,
          typeLine: card.data.typeLine,
          canCast: card.canCast(this.gameRef),
          activatedAbilities: [],
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
