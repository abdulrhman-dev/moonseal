import type { CardState } from "./cards";

export type Triggers =
  | ["CARD_TAP", { selfId: number }]
  | ["RESOLVES", { selfId: number; targets?: CardState[] }];

export type TriggerNames = Triggers extends [infer TriggerName, unknown]
  ? TriggerName
  : never;
