import { PhaseButton } from "@/components/PhaseButton";
import { PlayerInfo } from "@/components/PlayerInfo";
import { Button } from "@/components/ui/button";
import { socketEmit } from "@/features/socket/SocketFactory";
import type { RootState } from "@/features/store";
import { clearTargets } from "@/features/TargetingSlice";
import { Mulligan } from "@/modals/Mulligan";
import { useDispatch, useSelector } from "react-redux";

const phaseLabels: Record<string, string> = {
  BEGINNING_UNTAP: "البداية - فك التثبيت",
  BEGINNING_UNKEEP: "البداية - الصيانة",
  BEGINNING_DRAW: "البداية - السحب",
  MAIN_PHASE_1: "المرحلة الرئيسية الأولى",
  COMBAT_BEGIN: "بداية القتال",
  COMBAT_ATTACK: "الهجوم",
  COMBAT_BLOCK: "الحجب",
  COMBAT_DAMAGE: "الضرر",
  COMBAT_END: "نهاية القتال",
  MAIN_PHASE_2: "المرحلة الرئيسية الثانية",
  END_STEP: "خطوة النهاية",
  CLEANUP: "التنظيف",
  NONE: "قبل البداية",
};

const UILayer = () => {
  const game = useSelector((state: RootState) => state.game);
  const targeting = useSelector((state: RootState) => state.targeting);
  const dispatch = useDispatch();

  const gameStarted = game.player.ready;

  function handleCancel() {
    socketEmit({
      name: "send-targets:action",
      data: targeting.targets,
    });
    dispatch(clearTargets());
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Deck Selection - Only before game starts */}
      {/* Mulligan Modal - Only before game starts */}
      {!gameStarted && <Mulligan />}

      {/* Player Info - Only after game starts */}
      <PlayerInfo
        player={game.player}
        isOpponent={false}
        gameStarted={gameStarted}
      />
      <PlayerInfo
        player={game.opponentPlayer}
        isOpponent={true}
        gameStarted={gameStarted}
      />

      {/* Phase Button and Auto-Skip */}
      {gameStarted && <PhaseButton />}

      {/* Phase Display - Always visible */}
      <div className="pointer-events-none fixed right-6 bottom-6 rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-sm font-medium tracking-[0.08em] text-slate-100 shadow-lg shadow-slate-950/30 backdrop-blur-xl">
        <span className="ml-2 text-slate-400">المرحلة:</span>
        {phaseLabels[game.currentPhase] ?? game.currentPhase}
      </div>

      {/* Cancel Targeting Button */}
      {targeting.canCancel && (
        <Button
          className="pointer-events-auto fixed right-6 bottom-28 h-11 rounded-full bg-destructive px-5 text-sm font-semibold text-destructive-foreground shadow-xl shadow-red-950/20 hover:bg-destructive/90"
          onClick={handleCancel}
        >
          إلغاء
        </Button>
      )}
    </div>
  );
};

export default UILayer;
