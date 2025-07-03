// custom hooks
import useImage from "@/game/hooks/image";
import useCanCast from "@/game/hooks/useCanCast";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  addToBattleField,
  castSpell,
  removeShowcase,
  showcaseOnStack,
  toggleAttacker,
  toggleBlocker,
} from "@/store/PlayersSlice";
import type { RootState } from "@/store/store";

// types
import { type CardState, type TargetSelect } from "@/types/cards";

import Style from "@/css/card.module.css";
import useGetTargets from "@/game/hooks/useGetTargets";
import { addTarget, removeTarget } from "@/store/TargetingSlice";
import useCanTarget from "@/game/hooks/useCanTarget";
import type { AddRefFunction } from "@/App";

// icons
import { IoIosUndo } from "react-icons/io";
import { WiStars } from "react-icons/wi";

// logic
import { spendMana } from "@/game/logic/manaLogic";

interface CardProps {
  card: CardState;
  location: "hand" | "battlefield" | "stack";
  style?: React.CSSProperties | undefined;
  cardPlayer: 0 | 1 | 2;
  addRef?: AddRefFunction;
}

function Card({ card, location, style, cardPlayer, addRef }: CardProps) {
  // redux state
  const player = useSelector(
    (state: RootState) => state.players.player[cardPlayer - 1]
  );
  const currPhase = useSelector(
    (state: RootState) => state.players.current_phase
  );
  const activePLayer = useSelector(
    (state: RootState) => state.players.current_player
  );
  const targeting = useSelector((state: RootState) => state.targeting);
  const attackers = useSelector((state: RootState) => state.players.fights).map(
    (fight) => fight.attacker
  );

  const declaredAttackers = useSelector(
    (state: RootState) => state.players.declaredAttackers
  );

  const declaredBlockers = useSelector(
    (state: RootState) => state.players.declaredBlockers
  );
  const dispatch = useDispatch();

  const { image } = useImage(card.gameId.toString());
  const { getTargets } = useGetTargets();
  const canCast = useCanCast(card, cardPlayer);
  const canTarget = useCanTarget(card, cardPlayer);

  const handleCardClick = async () => {
    if (!cardPlayer) return;

    if (location === "battlefield") {
      if (canTarget) {
        if (targeting.targets.find((target) => target.data.id === card.id)) {
          dispatch(removeTarget(card.id));
        } else {
          dispatch(
            addTarget({ data: card, type: card.type, player: cardPlayer })
          );
        }
        return;
      }

      if (
        currPhase === "COMBAT_ATTACK" &&
        cardPlayer === activePLayer &&
        !declaredAttackers
      ) {
        if (card.summoningSickness || card.tapped) return;

        dispatch(toggleAttacker(card.id));
      }

      if (
        currPhase === "COMBAT_BLOCK" &&
        cardPlayer !== activePLayer &&
        !declaredBlockers
      ) {
        if (card.summoningSickness || card.tapped) return;

        const targetRules: TargetSelect[] = [
          {
            type: "creature",
            amount: 1,
            player: 2,
          },
        ];

        const callback = (targets: CardState[]) => {
          if (targets.length !== 1) return;

          if (!attackers.includes(targets[0].id)) {
            getTargets({ targetRules, cardPlayer }, callback);
            return;
          }

          dispatch(toggleBlocker({ id: card.id, target: targets[0].id }));
        };

        getTargets({ targetRules, cardPlayer }, callback);
      }
    } else if (location === "hand") {
      if (!canCast) return;

      spendMana(card, player, dispatch);

      if (card.type === "land") {
        dispatch(addToBattleField(card));
        return;
      }

      if (card.targetSelects.length > 0) {
        dispatch(
          showcaseOnStack({
            card,
            castedPlayer: cardPlayer,
            args: {},
            type: "SHOWCASE",
          })
        );

        const callback = (targets: CardState[]) => {
          if (targets.length !== card.targetSelects.length) return;
          dispatch(removeShowcase());
          dispatch(
            castSpell({
              card,
              castedPlayer: cardPlayer,
              args: { targets, cardPlayer },
              type: "CAST",
            })
          );
        };

        getTargets({ targetRules: card.targetSelects, cardPlayer }, callback);
      } else {
        dispatch(
          castSpell({
            card,
            castedPlayer: cardPlayer,
            args: { cardPlayer },
            type: "CAST",
          })
        );
      }
    }
  };

  return (
    <div className={Style.cardContainer} style={{ ...style }}>
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
        } ${canCast && location === "hand" ? Style.canCast : ""} ${
          card.tapped ? Style.tapped : ""
        } ${attackers.includes(card.id) ? Style.attacking : ""} ${
          location === "battlefield" && canTarget ? Style.targetable : ""
        } ${
          (card.tapped || card.summoningSickness) && location === "battlefield"
            ? Style.effect
            : ""
        } ${location === "stack" ? Style.instack : ""} `}
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
