import { card } from "@/css/card.module.css";
import type {
  CardTypes,
  Keyword,
  TargetData,
  // Mana,
  // ActivatedData,
  // CardResolveData,
} from "../types/cards";
import type Game from "./Game";

import Mana from "./Mana";
import type Player from "./Player";
import { CardCollection } from "./CardCollection";

export type CardResolveServerArgs = {
  targets: Card[][];
};

export type CardData = {
  readonly gameId: number;
  type: CardTypes;
  name: string;
  typeLine: string;
  text: string;
  summoningSickness: boolean;
  manaCost: Mana;
  manaGiven?: Mana;
  keywords: Keyword[];
  readonly defaultPower: number;
  readonly defaultToughness: number;
};

const fastSpells: CardTypes[] = ["instant"] as const;

export function enchantCard(args: CardResolveServerArgs, enchantment: Card) {
  const { targets: rawTargets } = args;

  const targets = !rawTargets.length ? [] : rawTargets[0];

  if (targets.length !== 1) return;

  targets[0].attachEnchantment(enchantment);
}
export abstract class Card {
  static idCounter: number = 0;
  id: number;

  data: CardData;

  keywords: Keyword[] = [];
  targetData: TargetData[] = [];
  enchanters: CardCollection = new CardCollection();

  power: number = 0;
  toughness: number = 0;

  tapped: boolean = false;
  cardPlayer: 0 | 1 | 2 = 0;

  //   activatedAbilities: ActivatedData[] = [];
  //   activatedActions: ((args: CardResolveData) => void)[] = [];

  constructor(data: CardData) {
    this.id = Card.idCounter++;
    this.data = data;

    this.power = this.data.defaultPower;
    this.toughness = this.data.defaultToughness;
  }

  abstract resolve(player: Player, args: CardResolveServerArgs): void;
  abstract cast(): void;

  canCast(game: Game) {
    const player = game.getPlayer(this.cardPlayer);
    const currPhase = game.currentPhase;
    const isActive = game.activePlayer === this.cardPlayer;
    const stackLength = game.stack.cards.length;

    if (currPhase === "NONE") return false;

    if (this.data.type === "land")
      return (
        (currPhase === "MAIN_PHASE_1" || currPhase === "MAIN_PHASE_2") &&
        stackLength === 0 &&
        player.landsCasted <= 0 &&
        isActive
      );

    if (stackLength === 0) {
      if (!isActive && !fastSpells.includes(this.data.type)) return false;

      if (
        currPhase !== "MAIN_PHASE_1" &&
        currPhase !== "MAIN_PHASE_2" &&
        !fastSpells.includes(this.data.type)
      )
        return false;
    } else if (!fastSpells.includes(this.data.type)) {
      return false;
    }

    return player.maxManaPool.canFit(this.data.manaCost);
  }

  getManaGiven() {
    return new Mana(this.data.manaGiven);
  }

  getManaCost() {
    return this.data.manaCost;
  }

  tapCard() {
    this.tapped = true;
  }

  unTapCard() {
    this.tapped = false;
  }

  addTargetSelector(targetData: TargetData) {
    this.targetData.push(targetData);
    return this;
  }

  attachEnchantment(enchantment: Card) {
    enchantment.enchant(this);
    this.enchanters.add(enchantment);
  }

  enchant(card: Card) {}
}
