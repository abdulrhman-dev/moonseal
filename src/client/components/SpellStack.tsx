import type { CardState } from "@backend/types/cards";
import Card from "./Card";

type SpellStackProps = {
  cards: CardState[];
};
export const SpellStack = ({ cards }: SpellStackProps) => {
  return (
    <group position={[-5.23, 1, 3]} rotation={[Math.PI / 20, 0, 0]}>
      {cards.map((card, index) => (
        <group
          key={card.id + 500}
          rotation={[
            0,
            0,
            Math.PI / 9 + (-Math.PI / 9 / cards.length) * (index + 1),
          ]}
        >
          <Card
            card={card}
            location="stack"
            transformation={{
              angle: 0,
              xPos: -(0.2 * (cards.length - index - 1)),
              zPos: 0.02 * index,
            }}
          />
        </group>
      ))}
    </group>
  );
};
