import useImage from "@/cards/util/image";
import type { CardState } from "@/types/cards";
interface CardProps {
  card: CardState;
}

function Card({ card }: CardProps) {
  const { image } = useImage(card.game_id.toString());

  return (
    <div>
      <p>{card.name}</p>
      <img src={image} />
    </div>
  );
}

export default Card;
