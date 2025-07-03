import React, { useEffect, useRef, useState } from "react";

import Style from "@/css/mulligan.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  drawCard,
  pushLibrary,
  removeCardHand,
  setReady,
  shuffleLibary,
} from "@/store/PlayersSlice";
import type { RootState } from "@/store/store";
import { decks } from "@/deck";

export const Mulligan = ({ player }: { player: 1 | 2 }) => {
  const [drawNum, setDrawNum] = useState(10);
  const dispatch = useDispatch();
  const library = useSelector(
    (state: RootState) => state.players.player[player - 1].library
  );
  const hand = useSelector(
    (state: RootState) => state.players.player[player - 1].hand
  );

  useEffect(() => {
    const deckSize = decks[player].reduce(
      (prev, card) => card.amount + prev,
      0
    );
    // intially draw 7 cards
    if (hand.length === 0 && deckSize === library.length) {
      for (let i = 0; i < drawNum; ++i) {
        dispatch(drawCard(player));
      }
    }
  }, [library]);

  function handleDrawAgain() {
    for (const card of hand) {
      dispatch(pushLibrary({ card, player }));
      dispatch(removeCardHand({ id: card.id, player }));
    }
    dispatch(shuffleLibary({ player }));
    setDrawNum(drawNum - 1);
  }

  function keepCards() {
    dispatch(setReady(player));
  }

  return (
    <div
      className={Style.mulliganContainer}
      style={{ top: player === 1 ? "80vh" : "" }}
    >
      <button className={Style.draw} onClick={handleDrawAgain}>
        اسحب يد أخرى
      </button>
      <button className={Style.keep} onClick={keepCards}>
        احتفظ باليد{" "}
      </button>
    </div>
  );
};
