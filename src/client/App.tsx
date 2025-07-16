import { useDispatch } from "react-redux";
import { type AppDispatch } from "./features/store";
import { useEffect, useRef } from "react";

import Style from "./css/app.module.css";
import { initSocket } from "./features/SocketSlice";
import GameLayer from "./layers/GameLayer";
import UILayer from "./layers/UILayer";
import CardObjectsProvider from "./game/providers/CardObjectsProvider";

export type AddRefFunction = (node: HTMLElement, cardId: number) => void;

function App() {
  const dispatch = useDispatch<AppDispatch>();

  let initlizedSocket = useRef(false);

  useEffect(() => {
    if (!initlizedSocket.current) {
      dispatch(initSocket());
    }
    initlizedSocket.current = true;
  }, []);

  return (
    <div className={Style.container}>
      <CardObjectsProvider>
        <GameLayer />
      </CardObjectsProvider>
      <UILayer />
    </div>
  );
}

export default App;
