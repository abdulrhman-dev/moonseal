import type { RootState } from "@/features/store";
import type { CardState, TargetData } from "@backend/types/cards";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetTargets from "./useGetTargets";
import useCanTarget from "./useCanTarget";
import type { CardLocations } from "@/components/Card";
import { addTarget, removeTarget } from "@/features/TargetingSlice";
import { socketEmit } from "@/features/socket/SocketFactory";

function useHandleCardLogic(card: CardState, location: CardLocations) {
  const cardPlayer = card.cardPlayer;

  const [showActivated, setShowActivated] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);

  const dispatch = useDispatch();

  /* Redux State */
  const currentPhase = useSelector(
    (state: RootState) => state.game.currentPhase
  );
  const isActive = useSelector((state: RootState) => state.game.isActive);

  const priority = useSelector((state: RootState) => state.game.priority);
  const targeting = useSelector((state: RootState) => state.targeting);

  const fights = useSelector((state: RootState) => state.game.fights);
  const attackers = useSelector((state: RootState) => state.game.fights).map(
    (fight) => fight.attacker
  );
  const declaredAttackers = useSelector(
    (state: RootState) => state.game.declaredAttackers
  );
  const declaredBlockers = useSelector(
    (state: RootState) => state.game.declaredBlockers
  );

  const { getTargets } = useGetTargets();
  const canTarget = useCanTarget(card, location, cardPlayer);

  useEffect(() => {
    setShowActivated(0);
    if (currentPhase === "MAIN_PHASE_2") setIsBlocking(false);
  }, [currentPhase]);

  /* Card Click Handling */

  const handleTargeting = () => {
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
  };

  const handleBattlefieldClick = async () => {
    if (!cardPlayer) return;

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

      let foundBlocker = fights.find(
        (fight) =>
          fight.blockers.find((blocker) => blocker.id === card.id) !== undefined
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

        const targets = await getTargets({ targetData, card, location });

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
  };

  const handleHandClick = async () => {
    if (!cardPlayer) return;

    console.log("HELLO WORLDO");

    if (card.targetData.length > 0) {
      socketEmit({
        name: "cast-spell:action",
        data: { id: card.id, args: {}, type: { name: "SHOWCASE" } },
      });

      const chosenTargets = [];

      for (const targetElement of card.targetData) {
        const targets = await getTargets({
          targetData: targetElement,
          card,
          location,
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
  };

  const handleCardCast = async () => {
    console.log("HELLO!!");
    if (!cardPlayer) return;

    handleTargeting();

    if (cardPlayer === 2) return;

    if (location === "battlefield") {
      await handleBattlefieldClick();
    }

    if (card.canCast && location === "hand") {
      await handleHandClick();
    }

    if (currentPhase === "COMBAT_ATTACK" && isActive && !declaredAttackers)
      return;

    if (showActivated === 2) setShowActivated(0);
    else setShowActivated(showActivated + 1);
  };

  return {
    flags: {
      isBlocking,
      showActivated: showActivated === 2,
      canTarget,
      isAttacking: attackers.includes(card.id),
      hasPriority: priority === 1,
    },
    handleCardCast,
  };
}

export default useHandleCardLogic;
