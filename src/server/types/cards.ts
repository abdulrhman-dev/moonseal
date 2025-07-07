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

export type CardTrigger = {
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

export type CardResolveArgs = {
  targets?: CardState[][];
};

export interface CardState {
  readonly gameId: number;
  id: number;
  type: CardTypes;
  name: string;
  typeLine: string;
  text: string;

  targetData: TargetData[];
  targets: number[];
  enchanters: CardState[];

  power: number;
  toughness: number;

  readonly defaultPower: number;
  readonly defaultToughness: number;

  tapped: boolean;
  summoningSickness: boolean;

  canCast: boolean;

  // activatedAbilities: ActivatedData[];

  cardPlayer: 0 | 1 | 2;

  // triggers: TriggerNames[];
}
