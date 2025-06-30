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
  mana_cost: {},
  keywords: [],
  enchanters: [],
  targets: [],
  target_selects: [],
  default_power: 0,
  default_toughness: 0,
  triggers: {},
  mana_given: {},
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
  can_tap: boolean;

  keywords: Keyword[];

  target_selects: TargetSelect[];
  enchanters: Card[];

  mana_cost: Mana;
  mana_given: Mana;

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
  can_tap: boolean;

  keywords: Keyword[];

  target_selects: TargetSelect[];
  targets: number[];
  enchanters: Card[];

  mana_cost: Mana;
  mana_given: Mana;

  readonly default_power: number;
  readonly default_toughness: number;

  power: number;
  toughness: number;

  tapped: boolean;
}
