import { type OpponentPlayer, type Player } from "@/features/GameSlice";
import {
  Heart,
  Wand2,
  Sword,
  Skull,
  Flame,
  Leaf,
  Crown,
  Droplets,
  Circle,
} from "lucide-react";

type PlayerInfoProps = {
  player: Player | OpponentPlayer;
  isOpponent: boolean;
  gameStarted: boolean;
};

export const PlayerInfo = ({
  player,
  isOpponent,
  gameStarted,
}: PlayerInfoProps) => {
  if (!gameStarted) return null;

  const alignment = isOpponent ? "left-6" : "right-6";
  const position = isOpponent ? "top-6" : "bottom-6";

  return (
    <div
      className={`pointer-events-none fixed ${alignment} ${position} flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur-xl`}
    >
      {/* Life Total */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-rose-500/20 ring-1 ring-rose-400/50">
          <Heart className="size-5 text-rose-400" fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Life Total</span>
          <span className="text-lg font-bold text-rose-300">{player.life}</span>
        </div>
      </div>

      {/* Cards in Hand */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-400/50">
          <Wand2 className="size-5 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Hand</span>
          <span className="font-semibold text-indigo-300">
            {player.hand.length} cards
          </span>
        </div>
      </div>

      {/* Mana Pool */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-slate-400" />
          <span className="text-xs text-slate-400">Mana</span>
        </div>
      </div>

      {/* Battlefield Stats */}
      <div className="space-y-1.5 border-t border-white/10 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-green-500/20 ring-1 ring-green-400/40">
            <Sword className="size-4 text-green-400" />
          </div>
          <span className="text-slate-300">
            {player.battlefield.creatures.length} creatures
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-400/40">
            <Leaf className="size-4 text-amber-400" />
          </div>
          <span className="text-slate-300">
            {player.battlefield.lands.length} lands
          </span>
        </div>
      </div>

      {/* Graveyard & Exile */}
      <div className="space-y-1.5 border-t border-white/10 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-purple-500/20 ring-1 ring-purple-400/40">
            <Skull className="size-4 text-purple-400" />
          </div>
          <span className="text-slate-300">
            {player.graveyard.length} graveyard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-yellow-500/20 ring-1 ring-yellow-400/40">
            <Flame className="size-4 text-yellow-400" />
          </div>
          <span className="text-slate-300">{player.exile.length} exiled</span>
        </div>
      </div>
    </div>
  );
};
