import useImage from "@/cards/util/image";
import type { CardState } from "@/types/cards";

import Style from "@/css/card.module.css";
interface CardProps {
  card: CardState;
  location: "hand" | "battlefield";
  style?: React.CSSProperties | undefined;
}

function Card({ card, location, style }: CardProps) {
  const { image } = useImage(card.game_id.toString());

  return (
    <div
      className={`${Style.card} ${
        location === "hand" ? Style.inhand : Style.inbattlefield
      } `}
      style={{ ...style, backgroundImage: `url(${image})` }}
    >
      {card.type === "creature" && (
        <div className={Style.cardPlate}>
          <p>
            {card.power}/{card.toughness}
          </p>
        </div>
      )}
    </div>
  );
}

export default Card;
