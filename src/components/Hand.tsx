import type { CardState } from "@/types/cards";
import Card from "./Card";

import Style from "@/css/hand.module.css";

type HandProps = {
  cards: CardState[];
  player: 1 | 2;
};

export const Hand = ({ cards, player }: HandProps) => {
  return (
    <div className={Style.hand}>
      {cards.map((card) => (
        <Card key={card.id} cardPlayer={player} card={card} location="hand" />
      ))}
    </div>
  );
};
