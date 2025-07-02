// custom hooks
import useImage from "@/game/hooks/image";
import useCanCast from "@/game/hooks/useCanCast";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  addToBattleField,
  castSpell,
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
  location: "hand" | "battlefield";
  style?: React.CSSProperties | undefined;
  cardPlayer: 1 | 2;
  addRef: AddRefFunction;
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

  const handleCardClick = () => {
    if (location === "battlefield") {
      if (canTarget) {
        if (targeting.targets.find((target) => target.id === card.id)) {
          dispatch(removeTarget(card.id));
        } else {
          dispatch(
            addTarget({ id: card.id, type: card.type, player: cardPlayer })
          );
        }
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

        const targetRule: TargetSelect[] = [
          {
            type: "creature",
            amount: 1,
            player: activePLayer,
          },
        ];

        const callback = (targets: number[]) => {
          if (targets.length !== 1) return;

          if (!attackers.includes(targets[0])) {
            getTargets(targetRule, callback);
            return;
          }

          dispatch(toggleBlocker({ id: card.id, target: targets[0] }));
        };

        getTargets(targetRule, callback);
      }
    } else if (location === "hand") {
      if (currPhase !== "MAIN_PHASE_1" && currPhase !== "MAIN_PHASE_2") return;

      if (!canCast) return;

      spendMana(card, player, dispatch);

      if (card.type === "land") {
        dispatch(addToBattleField(card));
        return;
      }
      // TODO: HANDLE GETTING TARGETS
      dispatch(
        castSpell({ card, castedPlayer: cardPlayer, args: {}, type: "CAST" })
      );
    }
  };

  return (
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
      }`}
      style={{
        ...style,
        backgroundImage: `url(${image})`,
        transformOrigin: cardPlayer === 1 ? "bottom" : "top",
      }}
      onClick={handleCardClick}
      ref={(node) => {
        if (node) addRef(node, card.id);
      }}
    >
      {card.tapped && <IoIosUndo className={Style.icon} />}
      {card.summoningSickness && location === "battlefield" && (
        <WiStars className={Style.icon} />
      )}

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
