import type { CardState } from "@/types/cards";
import Card from "./Card";

import Style from "@/css/hand.module.css";

import type { AddRefFunction } from "@/App";

type HandProps = {
  cards: CardState[];
  player: 1 | 2;
  addRef: AddRefFunction;
};

export const Hand = ({ cards, player, addRef }: HandProps) => {
  return (
    <div className={Style.hand}>
      {cards.map((card) => (
        <Card
          key={card.id}
          cardPlayer={player}
          card={card}
          location="hand"
          addRef={addRef}
        />
      ))}
    </div>
  );
};
