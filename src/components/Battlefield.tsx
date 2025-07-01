import Style from "@/css/battlefield.module.css";
import Card from "./Card";

import type { CardState } from "@/types/cards";
import type { AddRefFunction } from "@/App";

type BattlefieldProps = {
  data: { creatures: CardState[]; lands: CardState[] };
  player: 1 | 2;
  addRef: AddRefFunction;
};

const STEP_SIZE = 20;

export const Battlefield = ({ data, player, addRef }: BattlefieldProps) => {
  return (
    <div className={Style.battlefield}>
      <div className={Style.creatures}>
        {data.creatures.map((card) => (
          <Card
            key={card.id}
            cardPlayer={player}
            card={card}
            location="battlefield"
            addRef={addRef}
          />
        ))}
      </div>
      <div className={Style.lands}>
        <div className={Style.cardStack}>
          {data.lands.map((card, index) => (
            <Card
              key={card.id}
              cardPlayer={player}
              style={{
                position: "absolute",
                top: 0,
                left: index * STEP_SIZE,
              }}
              card={card}
              location="battlefield"
              addRef={addRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
