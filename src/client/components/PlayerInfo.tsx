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
      className={`pointer-events-none fixed ${alignment} ${position} flex items-center gap-1.5 rounded-full border border-indigo-200/20 bg-indigo-950/52 px-3 py-2 text-indigo-50 shadow-[0_16px_34px_rgba(10,9,29,0.45)] backdrop-blur-xl`}
    >
      <div className="flex items-center gap-1.5 rounded-full bg-indigo-400/12 px-2.5 py-1.5 text-xs font-semibold text-indigo-50 ring-1 ring-indigo-200/22">
        <Heart className="size-3.5 text-indigo-200" fill="currentColor" />
        {player.life}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/14 px-2.5 py-1.5 text-xs font-semibold text-indigo-50 ring-1 ring-indigo-200/22">
        <Wand2 className="size-3.5 text-indigo-100" />
        {player.hand.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-violet-400/12 px-2.5 py-1.5 text-xs font-semibold text-violet-50 ring-1 ring-violet-200/22">
        <Sword className="size-3.5 text-violet-200" />
        {player.battlefield.creatures.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-blue-400/12 px-2.5 py-1.5 text-xs font-semibold text-blue-50 ring-1 ring-blue-200/22">
        <Leaf className="size-3.5 text-blue-200" />
        {player.battlefield.lands.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-fuchsia-400/12 px-2.5 py-1.5 text-xs font-semibold text-fuchsia-50 ring-1 ring-fuchsia-200/22">
        <Skull className="size-3.5 text-fuchsia-200" />
        {player.graveyard.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-purple-400/12 px-2.5 py-1.5 text-xs font-semibold text-purple-50 ring-1 ring-purple-200/22">
        <Flame className="size-3.5 text-purple-200" />
        {player.exile.length}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-indigo-100/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-50 ring-1 ring-indigo-100/18">
        <Droplets className="size-3.5 text-indigo-200" />
        {manaTotal}
      </div>
    </div>
  );
};
