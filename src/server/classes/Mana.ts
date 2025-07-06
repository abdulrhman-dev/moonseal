export type ManaParams = {
  white?: number;
  blue?: number;
  black?: number;
  red?: number;
  green?: number;
  colorless?: number;
};

const manaTypes = [
  "white",
  "blue",
  "black",
  "red",
  "green",
  "colorless",
] as const;

export default class Mana {
  white: number = 0;
  blue: number = 0;
  black: number = 0;
  red: number = 0;
  green: number = 0;
  colorless: number = 0;

  constructor(data?: ManaParams) {
    const mana = {
      white: 0,
      blue: 0,
      black: 0,
      red: 0,
      green: 0,
      colorless: 0,
      ...data,
    };

    for (const manaType of manaTypes) {
      this[manaType] = mana[manaType];
    }
  }

  add(mana: Mana) {
    for (const manaType of manaTypes) {
      this[manaType] += mana[manaType];
    }
  }

  sub(mana: Mana) {
    for (const manaType of manaTypes) {
      this[manaType] -= mana[manaType];
    }

    if (this.colorless < 0) {
      let remaining = -this.colorless;
      this.colorless = 0;

      for (const manaType of manaTypes) {
        if (remaining === 0) return;
        if (manaType === "colorless") continue;

        const remainingTemp = remaining;

        remaining = Math.max(remaining - this[manaType], 0);
        this[manaType] = Math.max(this[manaType] - remainingTemp, 0);
      }

      this.colorless = -remaining;
    }
  }

  get invalid() {
    let invalid = false;
    for (const manaType of manaTypes) {
      invalid = invalid || this[manaType] < 0;
    }

    return invalid;
  }

  get empty() {
    let empty = true;

    for (const manaType of manaTypes) {
      empty = empty && this[manaType] == 0;
    }

    return empty;
  }

  shareTypes(mana: Mana) {
    if (mana.colorless > 0) return true;

    let share = false;

    for (const manaType of manaTypes) {
      share = share || (this[manaType] > 0 && mana[manaType] > 0);
    }

    return share;
  }

  canFit(mana: Mana) {
    const res = new Mana(this);

    res.sub(mana);

    return !res.invalid;
  }
}
