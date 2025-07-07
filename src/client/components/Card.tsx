// custom hooks
import useImage from "@/game/hooks/image";
// import useCanCast from "@/game/hooks/useCanCast";

// redux
import { useDispatch, useSelector } from "react-redux";
// import // addToBattleField,
// // castSpell,
// // incrementLandUsage,
// // removeShowcase,
// // showcaseOnStack,
// // toggleAttacker,
// // toggleBlocker,
// "@/store/PlayersSlice";
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

// logic
// import { spendMana } from "@/game/logic/manaLogic";
import { useState } from "react";
import { socketEmit } from "@/features/socket/SocketFactory";
// import { ActivatedAbility } from "./ActivatedAbility";

export type CardLocations = "hand" | "battlefield" | "stack";

interface CardProps {
  card: CardState;
  location: CardLocations;
  style?: React.CSSProperties | undefined;
  cardPlayer: 0 | 1 | 2;
  addRef?: AddRefFunction;
}

function Card({ card, location, style, cardPlayer, addRef }: CardProps) {
  // const [showActivated, setShowActivated] = useState(0);

  // const player = useSelector(
  //   (state: RootState) => state.game.player[cardPlayer - 1]
  // );
  const currentPhase = useSelector(
    (state: RootState) => state.game.currentPhase
  );
  const isActive = useSelector((state: RootState) => state.game.isActive);

  // const activePLayer = useSelector(
  //   (state: RootState) => state.game.current_player
  // );
  const targeting = useSelector((state: RootState) => state.targeting);
  const attackers = useSelector((state: RootState) => state.game.fights).map(
    (fight) => fight.attacker
  );

  const declaredAttackers = useSelector(
    (state: RootState) => state.game.declaredAttackers
  );

  const declaredBlockers = useSelector(
    (state: RootState) => state.game.declaredBlockers
  );
  const dispatch = useDispatch();

  const { image } = useImage(card.gameId.toString());
  const { getTargets } = useGetTargets();
  const canTarget = useCanTarget(card, location, cardPlayer);

  const handleCardClick = async () => {
    if (!cardPlayer) return;

    if (location === "battlefield") {
    }

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
      }
    }

    if (card.canCast && location === "hand")
      socketEmit({
        name: "cast-spell:action",
        data: { id: card.id, args: {}, type: { name: "CAST" } },
      });
  };

  return (
    <div className={Style.cardContainer} style={{ ...style }}>
      {/* {!card.summoningSickness &&
        showActivated === 2 &&
        card.activatedAbilities.length > 0 && (
          <ActivatedAbility
            activatedAbilities={card.activatedAbilities}
            player={player}
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
      ))} */}
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
        {card.tapped && <IoIosUndo className={Style.icon} />}
        {card.summoningSickness && location === "battlefield" && (
          <WiStars className={Style.icon} />
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
