import Style from "@/css/battlefield.module.css";
import Card from "./Card";

import type { CardState } from "@backend/types/cards";
import { CardsContainer } from "./CardsContainer";

type BattlefieldProps = {
  data: { creatures: CardState[]; lands: CardState[] };
};

export const Battlefield = ({ data }: BattlefieldProps) => {
  let nextZ = 0;

  return (
    <group position={[-1.2, 0, -1.9]}>
      <CardsContainer
        list={data.creatures}
        location="battlefield"
        transformation={{
          xPos: -3,
          yPos: 0,
          zPos: 0,
        }}
      />

      <group position={[10, 0, 0]}>
        {data.lands.map((card, index) => {
          let currZ = nextZ;

          nextZ += 0.015;
          nextZ += card.enchanters.length * 0.01;

          return (
            <Card
              card={card}
              location="battlefield"
              transformation={{
                angle: 0,
                xPos: 0.5 * (data.lands.length - index - 1),
                zPos: currZ,
              }}
              key={card.id}
            />
          );
        })}
      </group>
    </group>
  );
};
