import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "./features/store";
import { useEffect, useRef } from "react";

import Style from "./css/app.module.css";
import { Hand } from "./components/Hand";
import { initSocket } from "./features/SocketSlice";
import { Battlefield } from "./components/Battlefield";
import { PhaseButton } from "./components/PhaseButton";
import { TargetLine } from "./components/TargetLine";
import { SpellStack } from "./components/SpellStack";

export type AddRefFunction = (node: HTMLElement, cardId: number) => void;

function App() {
  const game = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch<AppDispatch>();
  const cardsElements = useRef<Map<number, HTMLElement>>(new Map());

  function addRef(node: HTMLElement, cardId: number) {
    cardsElements.current.set(cardId, node);
  }
  let initlizedSocket = useRef(false);
  useEffect(() => {
    if (!initlizedSocket.current) {
      dispatch(initSocket());
    }
    initlizedSocket.current = true;
  }, []);
  return (
    <div className={Style.container}>
      {game.fights.map((fight) =>
        fight.blockers.map((blocker) => (
          <TargetLine
            sourceId={blocker}
            destId={fight.attacker}
            cardsElements={cardsElements}
          />
        ))
      )}
      <Hand cards={game.opponentPlayer.hand} player={2} addRef={addRef} />

      <Battlefield
        data={game.opponentPlayer.battlefield}
        player={2}
        addRef={addRef}
      />
      <Battlefield data={game.player.battlefield} player={1} addRef={addRef} />

      <p className={Style.playerLife} style={{ bottom: 0, left: 0 }}>
        Player 1: {game.player.life}
      </p>
      <p className={Style.playerLife} style={{ top: 0, left: 0 }}>
        Player 2: {game.opponentPlayer.life}
      </p>

      <Hand cards={game.player.hand} player={1} addRef={addRef} />
      <PhaseButton />
      <p className={Style.phaseText}>{game.currentPhase}</p>

      {game.spellStack.length && (
        <SpellStack
          cards={game.spellStack.map((spellCard) => spellCard.data)}
        />
      )}
    </div>
  );
}

export default App;
