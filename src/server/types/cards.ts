import type { CardLocations } from "@/components/Card";
import type { TriggerNames, Triggers } from "./triggers";

export type CardTypes =
  | "land"
  | "creature"
  | "enchantment"
  | "instant"
  | "sorcery";

export type TargetSelect = {
  amount: number;
  type: CardTypes | "attacker";
  location: CardLocations;
  player: 1 | 2;
  isAttacker?: boolean;
  // isBlocker?: boolean;
  isTapped?: boolean;
};

// !If at least  one property has a non restricting value like "all" or 0
// !there can only be one instance of this in TargetSelect array
export type TargetSelectGroup =
  | TargetSelect[]
  | [
      {
        amount: number;
        type: CardTypes | "all";
        location: CardLocations | "all";
        player: 0 | 1 | 2;
        isAttacker?: boolean;
        isTapped?: boolean;
      }
    ];

export type TargetData = {
  targetSelects: TargetSelectGroup;
  type: "AND" | "OR";
  text: string;
};

type CardTrigger = {
  [Trigger in Triggers as `${Trigger[0]}`]?: (args: Trigger[1]) => void;
};

export type Keyword = "Enchant" | "Fight";

export type Mana = {
  white?: number;
  blue?: number;
  black?: number;
  red?: number;
  green?: number;
  colorless?: number;
};

export type ActivatedData = {
  cost: {
    mana: Mana;
    sacrfice: TargetData[];
    tap: boolean;
  };
  targets: TargetData[];
  text: string;
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
  targetData: [],
  defaultPower: 0,
  defaultToughness: 0,
  triggers: {},
  manaGiven: {},
  summoningSickness: false,
  activatedAbilities: [],
  activatedActions: [],
  resolve() {},
  valid() {},
};

export const CardStateDefault = {
  tapped: false,
  power: 0,
  toughness: 0,
  cardPlayer: 0,
};

export type CardResolveData = {
  targets?: CardState[][];
  cardPlayer?: 0 | 1 | 2;
};

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

  targetData: TargetData[];
  enchanters: Card[];

  manaCost: Mana;
  manaGiven: Mana;

  readonly defaultPower: number;
  readonly defaultToughness: number;

  activatedAbilities: ActivatedData[];

  activatedActions: ((args: CardResolveData) => void)[];

  triggers: CardTrigger;

  resolve: (data: CardResolveData) => void;
  valid: (args: { card: CardState }) => boolean;
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

  targetData: TargetData[];
  targets: number[];
  enchanters: CardState[];

  manaCost: Mana;
  manaGiven: Mana;

  readonly defaultPower: number;
  readonly defaultToughness: number;

  power: number;
  toughness: number;

  tapped: boolean;
  summoningSickness: boolean;

  activatedAbilities: ActivatedData[];

  cardPlayer: 0 | 1 | 2;

  triggers: TriggerNames[];
}
