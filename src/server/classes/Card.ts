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

export type CardData = {
  readonly gameId: number;
  type: CardTypes;
  name: string;
  typeLine: string;
  text: string;
  summoningSickness: boolean;
  manaCost: Mana;
  manaGiven?: Mana;
  readonly defaultPower: number;
  readonly defaultToughness: number;
};

const fastSpells: CardTypes[] = ["instant"] as const;

export abstract class Card {
  static idCounter: number = 0;
  id: number;

  data: CardData;

  keywords: Keyword[] = [];
  targetData: TargetData[] = [];
  // enchanters: Card[];

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

  canCast(game: Game) {
    const player = game.getPlayer(this.cardPlayer);
    const currPhase = game.currentPhase;
    const isActive = game.activePlayer === this.cardPlayer;

    if (currPhase === "NONE") return false;

    if (this.data.type === "land")
      return (
        (currPhase === "MAIN_PHASE_1" || currPhase === "MAIN_PHASE_2") &&
        player.landsCasted <= 0 &&
        isActive
      );

    if (!isActive && !fastSpells.includes(this.data.type)) return false;

    if (
      currPhase !== "MAIN_PHASE_1" &&
      currPhase !== "MAIN_PHASE_2" &&
      !fastSpells.includes(this.data.type)
    )
      return false;
    if (!isActive) return false;

    return player.maxManaPool.canFit(this.data.manaCost);
  }

  getManaGiven() {
    return new Mana(this.data.manaGiven);
  }

  // attachEnchantment();

  // TODO: Handle arguments better
  // abstract resolve(Player, targets: Card[]): void;
  abstract cast(): void;

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
}
