import type { CardState } from "@backend/types/cards";
import React from "react";
import Card from "./Card";
import Style from "@/css/stack.module.css";

type SpellStackProps = {
  cards: CardState[];
};

export const SpellStack = ({ cards }: SpellStackProps) => {
  return (
    <div className={Style.spellContainer}>
      <div className={Style.spellStack}>
        {cards.map((card, index) => (
          <Card
            key={card.id * 2}
            card={card}
            cardPlayer={0}
            location="stack"
            style={{
              position: "absolute",
              top: 0,
              transformOrigin: "bottom",
              transform: `rotate(${
                -20 - (-20 / cards.length) * (index + 1)
              }deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
