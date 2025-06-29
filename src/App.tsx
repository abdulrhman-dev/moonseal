import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store/store";
import { useEffect, useRef } from "react";

import Style from "./css/app.module.css";
import { Hand } from "./components/Hand";

import { getCardData } from "./game/logic/library";
import { Battlefield } from "./components/Battlefield";
import handlePhaseChange from "./game/handlers/handlePhaseChange";

function App() {
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.players);

  const intilizeDeck = useRef(false);

  // Setup Libary from deck for each player intially
  useEffect(() => {
    if (!intilizeDeck.current) {
      getCardData(dispatch);

      intilizeDeck.current = true;
    }
  }, []);

  useEffect(() => {
    console.log(players.current_phase);
    handlePhaseChange(players, dispatch);
  }, [players.current_phase]);

  return (
    <div className={Style.container}>
      <Hand cards={players.player[1].hand} player={2} />
      <Battlefield data={players.player[1].battlefield} player={2} />
      <Battlefield data={players.player[0].battlefield} player={1} />
      <Hand cards={players.player[0].hand} player={1} />
      <p className={Style.phaseText}>Current Phase: XYZ</p>
      <button className={Style.phaseButton}>Next Phase</button>
    </div>
  );
}

export default App;
