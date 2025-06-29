import type { Triggers } from "./triggers";

type CardType = "land" | "creature" | "enchantment" | "instant" | "sorcery";

export type TargetSelect = {
  amount: number;
  type: CardType;
  playerType: 0 | 1 | 2;
};

type CardTrigger = {
  [Trigger in Triggers as `${Trigger[0]}`]?: (args: Trigger[1]) => void;
};

type Keyword = "enchant";

type Mana = {
  white?: number;
  blue?: number;
  black?: number;
  red?: number;
  green?: number;
  colorless?: number;
};

export const CardDefault = {
  id: 0,
  type: "",
  name: "",
  mana_cost: {},
  keywords: [],
  enchanters: [],
  targets: [],
  targetSelects: [],
  default_power: 0,
  default_toughness: 0,
  triggers: {},
  manaGiven: {},
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
  readonly game_id: number;
  id: number;
  type: CardType;
  name: string;
  type_line: string;
  text: string;
  canTap: boolean;

  keywords: Keyword[];

  targetSelects: TargetSelect[];
  enchanters: Card[];

  mana_cost: Mana;
  manaGiven: Mana;

  readonly default_power: number;
  readonly default_toughness: number;

  triggers: CardTrigger;
  cast: (data: CardCastData) => void;
  valid: () => boolean;
}

export interface CardState {
  readonly game_id: number;
  id: number;
  type: CardType;
  name: string;
  type_line: string;
  text: string;
  canTap: boolean;

  keywords: Keyword[];

  targetSelects: TargetSelect[];
  targets: number[];
  enchanters: Card[];

  mana_cost: Mana;
  manaGiven: Mana;

  readonly default_power: number;
  readonly default_toughness: number;

  power: number;
  toughness: number;

  tapped: boolean;
}
