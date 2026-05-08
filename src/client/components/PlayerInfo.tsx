import { type OpponentPlayer, type Player } from "@/features/GameSlice";
import {
  Droplets,
  Flame,
  Heart,
  Leaf,
  Skull,
  Sword,
  Wand2,
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
  const position = isOpponent ? "top-6" : "bottom-20";
  const mana = "mana" in player ? player.mana : null;
  const manaTotal = mana
    ? mana.white +
      mana.blue +
      mana.black +
      mana.red +
      mana.green +
      mana.colorless
    : 0;

  return (
    <div
      className={`pointer-events-none fixed ${alignment} ${position} flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-slate-100 shadow-2xl shadow-slate-950/30 backdrop-blur-xl`}
    >
      <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-100 ring-1 ring-rose-400/15">
        <Heart className="size-3.5 text-rose-300" fill="currentColor" />
        {player.life}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-100 ring-1 ring-indigo-400/15">
        <Wand2 className="size-3.5 text-indigo-300" />
        {player.hand.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/15">
        <Sword className="size-3.5 text-emerald-300" />
        {player.battlefield.creatures.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/15">
        <Leaf className="size-3.5 text-amber-300" />
        {player.battlefield.lands.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-100 ring-1 ring-purple-400/15">
        <Skull className="size-3.5 text-purple-300" />
        {player.graveyard.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-100 ring-1 ring-yellow-400/15">
        <Flame className="size-3.5 text-yellow-300" />
        {player.exile.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-100 ring-1 ring-white/10">
        <Droplets className="size-3.5 text-sky-300" />
        {manaTotal}
      </div>
    </div>
  );
};
