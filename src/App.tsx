import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store/store";
import { useEffect, useRef, useState } from "react";

import { deck } from "./deck";
import { pushLibrary, shuffleLibary } from "./store/PlayersSlice";
import {
  type TargetSelect,
  type CardState,
  CardStateDefault,
} from "./types/cards";
import Card from "./components/Card";
function fitsTargetsRule(
  card: CardState,
  targetsRule: TargetSelect[]
): boolean {
  const ruleType = targetsRule.filter(
    (targetRule) => targetRule.type === card.type
  );

  return ruleType.length > 0 && ruleType[0].amount > 0;
}

function App() {
  const [targetsRule, setTargetsRule] = useState<TargetSelect[]>([]);
  const [targets, setTargets] = useState<number[]>([]);

  const dispatch = useDispatch();
  const playerCards = useSelector(
    (state: RootState) => state.players.current_player.library
  );

  const intilizeDeck = useRef(false);

  const addTarget = (card: CardState) => {
    if (!fitsTargetsRule(card, targetsRule)) return;

    console.log(card.id);

    setTargets([...targets, card.id]);
    setTargetsRule(
      targetsRule.map((targetRule) =>
        targetRule.type == card.type
          ? { ...targetRule, amount: targetRule.amount - 1 }
          : targetRule
      )
    );
  };

  const getCardData = async () => {
    if (playerCards.length > 0) return;

    for (const key of Object.keys(deck)) {
      const cardImport = await import(`./cards/logic/card_${key}`);
      const card = cardImport.default;

      // deleting non serializable props
      delete card["cast"];
      delete card["triggers"];
      delete card["valid"];

      // Adding extra props associated with card state
      const cardInput: CardState = {
        ...card,
        ...CardStateDefault,
      };

      type keysType = keyof typeof deck;
      let count = deck[key as keysType];

      while (count--) dispatch(pushLibrary({ player: 1, card: cardInput }));
    }

    dispatch(shuffleLibary({ player: 1 }));
  };

  useEffect(() => {
    if (!intilizeDeck.current) {
      getCardData();
      intilizeDeck.current = true;
    }
  }, []);

  const executeCast = async () => {
    const card = (await import("./cards/logic/card_559550")).default;
    card.cast({ targets });
  };

  useEffect(() => {
    if (targets.length > 0) {
      executeCast();
    }
  }, [targets]);
  return (
    <div>
      {playerCards.length}
      {playerCards.map((card) => (
        <Card card={card} key={card.id} />
      ))}
    </div>
  );
}

export default App;
