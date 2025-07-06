import type {
  CardTypes,
  Keyword,
  TargetData,
  // Mana,
  // ActivatedData,
  // CardResolveData,
} from "../types/cards";

import Mana from "./Mana";
import type Player from "./Player";

export type CardParams = {
  readonly gameId: number;
  type: CardTypes;
  name: string;
  typeLine: string;
  text: string;
  manaCost: Mana;
  manaGiven?: Mana;
  readonly defaultPower: number;
  readonly defaultToughness: number;
};

export abstract class Card {
  static idCounter: number = 0;
  id: number;

  data: {
    readonly gameId: number;
    type: CardTypes;
    name: string;
    typeLine: string;
    text: string;
    manaCost: Mana;
    manaGiven?: Mana;
    readonly defaultPower: number;
    readonly defaultToughness: number;
  };

  summoningSickness: boolean = false;
  keywords: Keyword[] = [];
  targetData: TargetData[] = [];
  // enchanters: Card[];

  power: number = 0;
  toughness: number = 0;

  tapped: boolean = false;
  cardPlayer: 0 | 1 | 2 = 0;

  //   activatedAbilities: ActivatedData[] = [];
  //   activatedActions: ((args: CardResolveData) => void)[] = [];

  constructor(data: CardParams) {
    this.id = Card.idCounter++;
    this.data = data;

    this.power = this.data.defaultPower;
    this.toughness = this.data.defaultToughness;
  }

  canCast(player: Player) {
    return player.manaPool.canFit(this.data.manaCost);
  }

  getManaGiven(player: Player) {
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
