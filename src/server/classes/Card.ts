import type {
  ActivatedData,
  ActivatedDataClient,
  CardTypes,
  Keyword,
  TargetData,
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

export type ActivatedAction = (
  player: Player,
  args: CardResolveServerArgs
) => void;
export abstract class Card {
  static idCounter: number = 0;
  id: number;

  data: CardData;

  targetData: TargetData[] = [];
  enchanters: CardCollection = new CardCollection();

  power: number = 0;
  toughness: number = 0;

  tempModifiedPower: number = 0;
  tempModifiedToughness: number = 0;

  modifiedPower: number = 0;
  modifiedToughness: number = 0;

  damage: number = 0;

  tapped: boolean = false;
  cardPlayer: 0 | 1 | 2 = 0;

  activatedAbilities: ActivatedData[] = [];
  activatedActions: ActivatedAction[] = [];

  tempKeywords: Keyword[] = [];
  gameRef: Game;

  constructor(data: CardData, game: Game) {
    this.id = Card.idCounter++;
    this.data = data;

    this.power = this.data.defaultPower;
    this.toughness = this.data.defaultToughness;
    this.gameRef = game;
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

    return player.maxManaPool.canFit(this.getManaCost());
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

  addActivitedAbility(
    activitedData: ActivatedData,
    activitedAction: ActivatedAction
  ) {
    this.activatedAbilities.push(activitedData);
    this.activatedActions.push(activitedAction);
  }

  activateAbility(
    actionNumber: number,
    player: Player,
    args: CardResolveServerArgs
  ) {
    if (actionNumber >= this.activatedActions.length) return;
    const ability = this.activatedAbilities[actionNumber];

    player.spendMana(new Mana(ability.cost.mana));

    if (ability.cost.tap) this.tapCard();

    this.activatedActions[actionNumber](player, args);

    if (ability.cost.sacrificeSelf) {
      if (this.data.type === "creature") {
        player.battlefield.creatures.remove(this.id);
        player.graveyard.add(this);
      }

      if (this.data.type === "land") {
        player.battlefield.lands.remove(this.id);
        player.graveyard.add(this);
      }
    }
  }

  attachEnchantment(enchantment: Card) {
    enchantment.enchant(this);
    this.enchanters.add(enchantment);
  }

  enchant(card: Card) {}

  getClientActivatedAbilities(game: Game): ActivatedDataClient[] {
    const player = game.getPlayer(this.cardPlayer);
    return this.activatedAbilities.map((activatedAbiliity) => ({
      ...activatedAbiliity,
      canActivate:
        player.maxManaPool.canFit(new Mana(activatedAbiliity.cost.mana)) &&
        !this.tapped,
    }));
  }

  get keywords() {
    return Array.from(new Set([...this.data.keywords, ...this.tempKeywords]));
  }

  get totalPower() {
    return this.power + this.modifiedPower + this.tempModifiedPower;
  }

  get totalToughness() {
    return (
      this.toughness +
      this.modifiedToughness +
      this.tempModifiedToughness -
      this.damage
    );
  }

  cleanup() {
    this.tempKeywords = [];
    this.damage = 0;
    this.tempModifiedPower = 0;
    this.tempModifiedToughness = 0;
  }
}
