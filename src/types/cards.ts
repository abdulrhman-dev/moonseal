import type { Triggers } from "./triggers";

export type CardTypes =
  | "land"
  | "creature"
  | "enchantment"
  | "instant"
  | "sorcery";

export type TargetSelect = {
  amount: number;
  type: CardTypes;
  player: 0 | 1 | 2;
};

type CardTrigger = {
  [Trigger in Triggers as `${Trigger[0]}`]?: (args: Trigger[1]) => void;
};

type Keyword = "enchant";

export type Mana = {
  white?: number;
  blue?: number;
  black?: number;
  red?: number;
  green?: number;
  colorless?: number;
};

export const ManaDefault = {
  white: 0,
  blue: 0,
  black: 0,
  red: 0,
  green: 0,
  colorless: 0,
};

export const CardDefault = {
  id: 0,
  type: "",
  name: "",
  manaCost: {},
  keywords: [],
  enchanters: [],
  targets: [],
  targetSelects: [],
  defaultPower: 0,
  defaultToughness: 0,
  triggers: {},
  manaGiven: {},
  summoningSickness: false,
  cast() {},
  valid() {},
};

export const CardStateDefault = {
  tapped: false,
  power: 0,
  toughness: 0,
};

type CardCastData = { targets: number[] };

export interface Card {
  readonly gameId: number;
  id: number;
  type: CardTypes;
  name: string;
  typeLine: string;
  text: string;
  canTap: boolean;
  summoningSickness: boolean;

  keywords: Keyword[];

  targetSelects: TargetSelect[];
  enchanters: Card[];

  manaCost: Mana;
  manaGiven: Mana;

  readonly defaultPower: number;
  readonly defaultToughness: number;

  triggers: CardTrigger;
  cast: (data: CardCastData) => void;
  valid: () => boolean;
}

export interface CardState {
  readonly gameId: number;
  id: number;
  type: CardTypes;
  name: string;
  typeLine: string;
  text: string;
  canTap: boolean;

  keywords: Keyword[];

  targetSelects: TargetSelect[];
  targets: number[];
  enchanters: Card[];

  manaCost: Mana;
  manaGiven: Mana;

  readonly defaultPower: number;
  readonly defaultToughness: number;

  power: number;
  toughness: number;

  tapped: boolean;
  summoningSickness: boolean;
}
