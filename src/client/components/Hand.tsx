import type { CardState } from "@backend/types/cards";
import Card from "./Card";

type HandProps = {
  cards: CardState[];
};

function Hand({ cards }: HandProps) {
  const cardSpacing = 1 / cards.length;
  const firstPos = 0.5 - ((cards.length - 1) * cardSpacing) / 2;

  return (
    <group>
      {cards.map((card, index) => {
        const shift = firstPos + index * cardSpacing;
        const range = Math.min(
          Math.PI / (-2.4 * cards.length + 24.8),
          Math.PI / 6
        );

        return (
          <Card
            key={card.id}
            card={card}
            location="hand"
            transformation={{
              angle: range * (shift * 2 - 1),
              zPos: index * 0.01,
              xPos: 0,
            }}
          />
        );
      })}
    </group>
  );
}

export default Hand;
