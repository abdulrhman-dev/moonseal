import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store/store";
import { useEffect, useRef } from "react";

import Style from "./css/app.module.css";
import { Hand } from "./components/Hand";

import { getCardData } from "./game/logic/libraryLogic";
import { Battlefield } from "./components/Battlefield";
import handlePhaseChange from "./game/handlers/handlePhaseChange";

import { TargetLine } from "./components/TargetLine";
import handlePriorityChange from "./game/handlers/handlePriorityChange";
import { PhaseButton } from "./components/PhaseButton";
import { SpellStack } from "./components/SpellStack";
import { Mulligan } from "./modals/Mulligan";
import {
  nextPhase,
  removeCardHand,
  shuffleLibary,
  startGame,
} from "./store/PlayersSlice";
import useGetTargets from "./game/hooks/useGetTargets";
import type { CardState, TargetSelect } from "./types/cards";

export type AddRefFunction = (node: HTMLElement, cardId: number) => void;

function App() {
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.players);
  const { getTargets } = useGetTargets();

  const cardsElements = useRef<Map<number, HTMLElement>>(new Map());
  const intilizeDeck = useRef(false);

  // Setup Libary from deck for each player intially
  useEffect(() => {
    if (!intilizeDeck.current) {
      getCardData(dispatch);
      intilizeDeck.current = true;
    }
  }, []);

  useEffect(() => {
    handlePhaseChange(players, dispatch);
  }, [players.current_phase]);

  useEffect(() => {
    handlePriorityChange(players, dispatch);
  }, [players.priority, players.spell_stack, players.current_phase, dispatch]);

  useEffect(() => {
    if (players.player[0].ready && players.player[1].ready) {
      // dispatch(startGame((Math.floor(Math.random() * 2) + 1) as 1 | 2));
      dispatch(startGame(1));
    }
  }, [players.player[0].ready, players.player[1].ready]);

  useEffect(() => {
    if (players.current_phase === "NONE") return;

    const handLength = players.player[players.current_player - 1].hand.length;

    if (handLength > 7 && players.current_phase === "CLEANUP") {
      const targetRules: TargetSelect[] = [
        {
          amount: handLength - 7,
          player: 1,
          type: "hand",
        },
      ];

      const callback = (targets: CardState[]) => {
        if (!players.current_player) return;

        for (const target of targets) {
          dispatch(
            removeCardHand({ id: target.id, player: players.current_player })
          );
        }
        dispatch(shuffleLibary({ player: players.current_player }));
        dispatch(nextPhase());
      };

      if (!players.current_player) return;

      getTargets({ targetRules, cardPlayer: players.current_player }, callback);
    } else if (players.current_phase === "CLEANUP") {
      dispatch(nextPhase());
    }
  }, [players.current_phase]);

  function addRef(node: HTMLElement, cardId: number) {
    cardsElements.current.set(cardId, node);
  }

  return (
    <div className={Style.container}>
      {players.fights.map((fight) =>
        fight.blockers.map((blocker) => (
          <TargetLine
            sourceId={blocker}
            destId={fight.attacker}
            cardsElements={cardsElements}
          />
        ))
      )}
      {players.player.map(
        (player, index) =>
          !player.ready && (
            <Mulligan key={index} player={(index + 1) as 1 | 2} />
          )
      )}

      <Hand cards={players.player[1].hand} player={2} addRef={addRef} />
      <Battlefield
        data={players.player[1].battlefield}
        player={2}
        addRef={addRef}
      />
      <Battlefield
        data={players.player[0].battlefield}
        player={1}
        addRef={addRef}
      />
      <Hand cards={players.player[0].hand} player={1} addRef={addRef} />
      <p className={Style.playerLife} style={{ bottom: 0, left: 0 }}>
        Player 1: {players.player[0].life}
      </p>
      <p className={Style.playerLife} style={{ top: 0, left: 0 }}>
        Player 2: {players.player[1].life}
      </p>
      <PhaseButton />
      <SpellStack cards={players.spell_stack.map((ability) => ability.card)} />
      <p className={Style.phaseText}>{players.current_phase}</p>
    </div>
  );
}

export default App;
