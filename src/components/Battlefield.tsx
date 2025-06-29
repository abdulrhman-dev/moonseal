import Style from "@/css/battlefield.module.css";
import Card from "./Card";

import type { CardState } from "@/types/cards";

type BattlefieldProps = {
  data: { creatures: CardState[]; lands: CardState[] };
  player: 1 | 2;
};

const STEP_SIZE = 20;

export const Battlefield = ({ data }: BattlefieldProps) => {
  return (
    <div className={Style.battlefield}>
      <div className={Style.creatures}>
        {data.creatures.map((card) => (
          <Card key={card.id} card={card} location="battlefield" />
        ))}
      </div>
      <div className={Style.lands}>
        <div className={Style.cardStack}>
          {data.lands.map((card, index) => (
            <Card
              key={card.id}
              style={{
                position: "absolute",
                top: 0,
                left: index * STEP_SIZE,
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
