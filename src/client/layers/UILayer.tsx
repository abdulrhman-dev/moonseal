import { PhaseButton } from "@/components/PhaseButton";
import Style from "@/css/app.module.css";
import { socketEmit } from "@/features/socket/SocketFactory";
import type { RootState } from "@/features/store";
import { clearTargets } from "@/features/TargetingSlice";
import { Mulligan } from "@/modals/Mulligan";
import { useDispatch, useSelector } from "react-redux";

const UILayer = () => {
  const game = useSelector((state: RootState) => state.game);
  const targeting = useSelector((state: RootState) => state.targeting);
  const dispatch = useDispatch();

  function handleCancel() {
    socketEmit({
      name: "send-targets:action",
      data: targeting.targets,
    });
    dispatch(clearTargets());
  }
  return (
    <div className={Style.uiLayerContainer}>
      {game.currentPhase === "NONE" && (
        <div className={Style.deckContainer}>
          <button
            onClick={() => socketEmit({ name: "choose-deck:action", data: 1 })}
          >
            1
          </button>
          <button
            onClick={() => socketEmit({ name: "choose-deck:action", data: 2 })}
          >
            2
          </button>
          <button
            onClick={() => socketEmit({ name: "choose-deck:action", data: 3 })}
          >
            3
          </button>
          <button
            onClick={() => socketEmit({ name: "choose-deck:action", data: 4 })}
          >
            4
          </button>
        </div>
      )}

      {!game.player.ready && <Mulligan />}
      <p className={Style.playerLife} style={{ bottom: 0, left: 0 }}>
        Player 1: {game.player.life}
      </p>
      <p className={Style.playerLife} style={{ top: 0, left: 0 }}>
        Player 2: {game.opponentPlayer.life}
      </p>
      <PhaseButton />
      <p className={Style.phaseText}>{game.currentPhase}</p>
      {targeting.canCancel && (
        <button className={Style.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
      )}
    </div>
  );
};

export default UILayer;
