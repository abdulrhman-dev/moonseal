import type { CardState } from "@backend/types/cards";
import Card, { type CardLocations } from "./Card";
import { CARD_WIDTH, DEFAULT_CARD_SPACING } from "@/game/constants";

type CardsContainerProps = {
  list: CardState[];
  cardSpacing?: number;
  location: CardLocations;
  transformation: {
    xPos: number;
    yPos: number;
    zPos: number;
  };
};

export const CardsContainer = ({
  list,
  cardSpacing = DEFAULT_CARD_SPACING,
  transformation,
  location,
}: CardsContainerProps) => {
  const { xPos, yPos, zPos } = transformation;

  const pivotSpacing = 1 / list.length;
  const firstPos = 0.5 - ((list.length - 1) * pivotSpacing) / 2;

  const fullWidth = (CARD_WIDTH + cardSpacing) * list.length - cardSpacing;

  return (
    <group position={[xPos, yPos, zPos]}>
      {list.map((card, index) => {
        const shift = firstPos + index * pivotSpacing;

        return (
          <Card
            key={card.id}
            card={card}
            transformation={{
              xPos: fullWidth * (shift * 2 - 1),
              zPos: 0,
              angle: 0,
            }}
            location={location}
          />
        );
      })}
    </group>
  );
};
