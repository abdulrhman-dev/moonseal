import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store/store";
import { useEffect, useRef } from "react";

import Style from "./css/app.module.css";
import { Hand } from "./components/Hand";

import { getCardData } from "./logic/library";
import { Battlefield } from "./components/Battlefield";

function App() {
  const dispatch = useDispatch();
  const playerCards = useSelector(
    (state: RootState) => state.players.current_player.library
  );

  const intilizeDeck = useRef(false);

  useEffect(() => {
    if (!intilizeDeck.current) {
      getCardData(playerCards, dispatch);
      intilizeDeck.current = true;
    }
  }, []);

  return (
    <div className={Style.container}>
      <Hand cards={playerCards} player={1} />
      <Battlefield cards={playerCards} player={1} />
      <Battlefield cards={playerCards} player={2} />
      <Hand cards={playerCards} player={2} />
      <p className={Style.phaseText}>Current Phase: XYZ</p>
      <button className={Style.phaseButton}>Next Phase</button>
    </div>
  );
}

export default App;
