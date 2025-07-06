// import type { PlayersState } from "@/store/PlayersSlice";
// import { canCast } from "../hooks/useCanCast";

// export const checkNeedPriority = async (
//   players: PlayersState,
//   playerNum: 1 | 2
// ) => {
//   const player = players.player[playerNum - 1];
//   if (!player) return;

//   for (const card of player.hand) {
//     const shouldCast = await canCast(
//       card,
//       players.spell_stack.length,
//       players.current_phase,
//       player,
//       playerNum === players.current_player
//     );

//     if (shouldCast) {
//       return true;
//     }
//   }

//   return false;
// };

// export const checkCanAttack = (players: PlayersState): boolean => {
//   return players.player[
//     players.current_player - 1
//   ].battlefield.creatures.reduce(
//     (prev, card) => prev || (!card.tapped && !card.summoningSickness),
//     false
//   );
// };

// export const checkCanBlock = (players: PlayersState) => {
//   return (
//     players.fights.length &&
//     players.player[
//       (players.current_player ^ 3) - 1
//     ].battlefield.creatures.reduce((prev, card) => prev || !card.tapped, false)
//   );
// };
