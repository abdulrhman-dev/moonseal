import type { CardState } from "@backend/types/cards";
import Card from "./Card";
import { CardsContainer } from "./CardsContainer";

type LookupProps = {
  cards: CardState[];
};

const Lookup = ({ cards }: LookupProps) => {
  return (
    <group position={[0, 0, 3.2]} rotation={[Math.PI / 20, 0, 0]} scale={0.8}>
      <CardsContainer
        list={cards}
        location="lookup"
        cardSpacing={0.5}
        transformation={{
          xPos: 0,
          yPos: 0.5,
          zPos: 0,
        }}
      />
      <mesh
        position={[0, 0, -2]}
        receiveShadow
        onPointerOver={(e) => e.stopPropagation()}
      >
        <planeGeometry args={[40, 40, 20]} />
        <meshStandardMaterial color={"black"} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default Lookup;
