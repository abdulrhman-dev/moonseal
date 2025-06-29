import type { RootState } from "@/store/store";
import { store } from "@/store/store";
import type { CardState } from "@/types/cards";

export function getCards(
  filterFunction: (card: CardState) => boolean = () => true
): CardState[] {
  const state: RootState = store.getState();

  const currentPlayerBattlefield = state.players.current_player.battlefield;
  const opposingPlayerBattlefield = state.players.opposing_player.battlefield;

  const cards = [
    ...currentPlayerBattlefield.creatures,
    ...currentPlayerBattlefield.lands,
    ...opposingPlayerBattlefield.creatures,
    ...opposingPlayerBattlefield.lands,
  ];

  return cards.filter((card) => filterFunction(card));
}
