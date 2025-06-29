import Style from "@/css/battlefield.module.css";
import Card from "./Card";

import type { CardState } from "@/types/cards";

type BattlefieldProps = {
  cards: CardState[];
  player: 1 | 2;
};

const STEP_SIZE = 20;

export const Battlefield = ({ cards }: BattlefieldProps) => {
  return (
    <div className={Style.battlefield}>
      <div className={Style.creatures}>
        {cards.map((card) => (
          <Card key={card.id} card={card} location="battlefield" />
        ))}
      </div>
      <div className={Style.lands}>
        <div className={Style.cardStack}>
          {cards.map((card, index) => (
            <Card
              key={card.id}
              style={{
                position: "absolute",
                top: 0,
                left: index * STEP_SIZE,
                backgroundColor: "red",
              }}
              card={card}
              location="battlefield"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
