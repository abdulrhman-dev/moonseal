// custom hooks
import useImage from "@/game/hooks/image";

// redux
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/features/store";

// types
import { type CardState, type TargetData } from "@backend/types/cards";

import Style from "@/css/card.module.css";
import useGetTargets from "@/game/hooks/useGetTargets";
import { addTarget, removeTarget } from "@/features/TargetingSlice";
import useCanTarget from "@/game/hooks/useCanTarget";
import type { AddRefFunction } from "@/App";

// icons
import { IoIosUndo } from "react-icons/io";
import { WiStars } from "react-icons/wi";
import { TbTargetArrow } from "react-icons/tb";
import { MdShield } from "react-icons/md";

// logic
import { useEffect, useState } from "react";
import { socketEmit } from "@/features/socket/SocketFactory";
import { ActivatedAbility } from "./ActivatedAbility";

export type CardLocations = "hand" | "battlefield" | "stack";

interface CardProps {
  card: CardState;
  location: CardLocations;
  style?: React.CSSProperties | undefined;
  cardPlayer: 0 | 1 | 2;
  addRef?: AddRefFunction;
}

function Card({ card, location, style, cardPlayer, addRef }: CardProps) {
  const [showActivated, setShowActivated] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);

  const currentPhase = useSelector(
    (state: RootState) => state.game.currentPhase
  );
  const isActive = useSelector((state: RootState) => state.game.isActive);
  const priority = useSelector((state: RootState) => state.game.priority);

  const targeting = useSelector((state: RootState) => state.targeting);
  const attackers = useSelector((state: RootState) => state.game.fights).map(
    (fight) => fight.attacker
  );
  const fights = useSelector((state: RootState) => state.game.fights);

  const declaredAttackers = useSelector(
    (state: RootState) => state.game.declaredAttackers
  );
  const declaredBlockers = useSelector(
    (state: RootState) => state.game.declaredBlockers
  );

  const stack = useSelector((state: RootState) => state.game.spellStack);

  const dispatch = useDispatch();

  const { image } = useImage(card.gameId.toString());
  const { getTargets } = useGetTargets();
  const canTarget = useCanTarget(card, location, cardPlayer);

  useEffect(() => {
    setShowActivated(0);
    if (currentPhase === "MAIN_PHASE_2") setIsBlocking(false);
  }, [currentPhase]);

  const handleCardClick = async () => {
    if (!cardPlayer) return;

    if (canTarget) {
      if (targeting.targets.find((target) => target.data.id === card.id)) {
        dispatch(removeTarget(card.id));
      } else {
        dispatch(
          addTarget({
            data: card,
            type: card.type,
            player: cardPlayer,
            location,
            isAttacker: attackers.includes(card.id),
          })
        );
      }
      return;
    }

    if (cardPlayer === 2) return;

    if (location === "battlefield") {
      if (currentPhase === "COMBAT_ATTACK" && isActive && !declaredAttackers) {
        const attacking = attackers.includes(card.id);
        if (card.summoningSickness || (card.tapped && !attacking)) return;

        socketEmit({
          name: "toggle-attacker:action",
          data: { attackerId: card.id },
        });
        return;
      }

      if (currentPhase === "COMBAT_BLOCK" && !isActive && !declaredBlockers) {
        if (card.tapped) return;

        let foundBlocker = fights.find((fight) =>
          fight.blockers.includes(card.id)
        );
        setIsBlocking(foundBlocker === undefined);
        if (!foundBlocker) {
          const targetData: TargetData = {
            type: "AND",
            text: "",
            targetSelects: [
              {
                type: "creature",
                amount: 1,
                player: 2,
                location: "battlefield",
                isAttacker: true,
              },
            ],
          };

          const targets = await getTargets({ targetData, cardPlayer });

          if (targets.length !== 1) return;
          socketEmit({
            name: "toggle-blocker:action",
            data: { blockerId: card.id, attackerId: targets[0].id },
          });
        } else {
          socketEmit({
            name: "toggle-blocker:action",
            data: { blockerId: card.id, attackerId: -1 },
          });
        }
      }
    }
    if (card.canCast && location === "hand") {
      if (card.targetData.length > 0) {
        socketEmit({
          name: "cast-spell:action",
          data: { id: card.id, args: {}, type: { name: "SHOWCASE" } },
        });

        const chosenTargets = [];

        for (const targetElement of card.targetData) {
          const targets = await getTargets({
            targetData: targetElement,
            cardPlayer,
          });

          chosenTargets.push(targets);
        }

        socketEmit({
          name: "cast-spell:action",
          data: {
            id: card.id,
            args: { targets: chosenTargets },
            type: { name: "CAST" },
          },
        });
      } else {
        socketEmit({
          name: "cast-spell:action",
          data: {
            id: card.id,
            args: {},
            type: { name: "CAST" },
          },
        });
      }
    }
    if (showActivated === 2) setShowActivated(0);
    else setShowActivated(showActivated + 1);
  };

  return (
    <div className={Style.cardContainer} style={{ ...style }}>
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
        } ${attackers.includes(card.id) ? Style.attacking : ""} ${
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
        onClick={handleCardClick}
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
