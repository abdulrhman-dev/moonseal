// custom hooks
import useImage from "@/game/hooks/image";

// redux
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";

// types
import { type CardState } from "@backend/types/cards";

import Style from "@/css/card.module.css";
import type { AddRefFunction } from "@/App";

// icons
import { IoIosUndo } from "react-icons/io";
import { WiStars } from "react-icons/wi";
import { TbTargetArrow } from "react-icons/tb";
import { MdShield } from "react-icons/md";

// logic
import { ActivatedAbility } from "./ActivatedAbility";
import { DamageAssignment } from "./DamageAssigment";
import useHandleCardLogic from "@/game/hooks/useHandleCardLogic";

export type CardLocations = "hand" | "battlefield" | "stack" | "lookup";

interface CardProps {
  card: CardState;
  location: CardLocations;
  style?: React.CSSProperties | undefined;
  cardPlayer: 0 | 1 | 2;
  addRef?: AddRefFunction;
}

function Card({ card, location, style, cardPlayer, addRef }: CardProps) {
  const stack = useSelector((state: RootState) => state.game.spellStack);
  const priority = useSelector((state: RootState) => state.game.priority);

  const { image } = useImage(card.gameId.toString());

  const { flags, handleCardCast } = useHandleCardLogic(card, location);
  const { showActivated, canTarget, isAttacking, isBlocking } = flags;

  return (
    <div className={Style.cardContainer} style={{ ...style }}>
      <DamageAssignment card={card} />

      {!card.summoningSickness &&
        showActivated === 2 &&
        priority === 1 &&
        card.activatedAbilities.length > 0 && (
          <ActivatedAbility
            activatedAbilities={card.activatedAbilities}
            card={card}
          />
        )}

      {card.enchanters.map((enchanter, index) => (
        <Card
          key={enchanter.id}
          card={enchanter}
          location={location}
          cardPlayer={cardPlayer}
          style={{
            position: "absolute",
            left: 15 * (card.enchanters.length - index),
            margin: 0,
          }}
        />
      ))}

      <div
        className={`${Style.card} ${
          location === "hand" ? Style.inhand : Style.inbattlefield
        } ${card.canCast && location === "hand" ? Style.canCast : ""} ${
          card.tapped ? Style.tapped : ""
        } ${isAttacking ? Style.attacking : ""} ${
          canTarget ? Style.targetable : ""
        } ${
          (card.tapped || card.summoningSickness) && location === "battlefield"
            ? Style.effect
            : ""
        } ${location === "stack" ? Style.instack : ""}  `}
        style={{
          backgroundImage: `url(${image})`,
          transformOrigin: cardPlayer === 1 ? "bottom" : "top",
        }}
        onClick={handleCardCast}
        ref={(node) => {
          if (addRef && node) addRef(node, card.id);
        }}
      >
        {stack.find((stackCard) => stackCard.targets.includes(card.id)) ? (
          <TbTargetArrow className={Style.icon} style={{ color: "white" }} />
        ) : (
          <>
            {card.tapped && <IoIosUndo className={Style.icon} />}
            {card.summoningSickness && location === "battlefield" && (
              <WiStars className={Style.icon} />
            )}
            {isBlocking && (
              <MdShield className={Style.icon} style={{ color: "#FF4F0F" }} />
            )}
          </>
        )}

        {card.type === "creature" && (
          <div className={Style.cardPlate}>
            <p>
              <span
                className={
                  card.power > card.defaultPower
                    ? Style.cardBuff
                    : card.power < card.defaultPower
                    ? Style.cardDebuff
                    : ""
                }
              >
                {card.power}
              </span>
              /
              <span
                className={
                  card.toughness > card.defaultToughness
                    ? Style.cardBuff
                    : card.toughness < card.defaultToughness
                    ? Style.cardDebuff
                    : ""
                }
              >
                {card.toughness}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
