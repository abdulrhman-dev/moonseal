import type { CardState } from "@backend/types/cards";

import Style from "@/css/loookup.module.css";
import Card from "./Card";

type LookupProps = {
  cards: CardState[];
};

export const Lookup = ({ cards }: LookupProps) => {
  return (
    <div className={Style.lookupContainer}>
      <div className={Style.lookCardContainer}>
        {cards.map((card) => (
          <Card
            card={card}
            cardPlayer={1}
            location="lookup"
            style={{
              transform: "scale(1.5)",
              opacity: "1",
            }}
          />
        ))}
      </div>
    </div>
  );
};
