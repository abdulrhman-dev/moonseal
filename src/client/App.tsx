import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "./features/store";
import { useEffect, useRef } from "react";

import Style from "./css/app.module.css";
import { initSocket } from "./features/SocketSlice";
import GameLayer from "./layers/GameLayer";
import UILayer from "./layers/UILayer";
import CardObjectsProvider from "./game/providers/CardObjectsProvider";
import RoomEntry from "./components/RoomEntry";
import RoomLobby from "./components/RoomLobby";

export type AddRefFunction = (node: HTMLElement, cardId: number) => void;

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const room = useSelector((state: RootState) => state.room);

  let initlizedSocket = useRef(false);

  useEffect(() => {
    if (!initlizedSocket.current) {
      dispatch(initSocket());
    }
    initlizedSocket.current = true;
  }, []);

  // Show room entry if no username or room code
  if (!room.username || !room.roomCode) {
    return <RoomEntry />;
  }

  // Show room lobby if room is set but game hasn't started
  if (!room.gameStarted) {
    return (
      <RoomLobby
        onLeaveRoom={() => {
          // User left the room, reset to show room entry
        }}
        onStartGame={() => {
          // Game started, game layer will take over
        }}
      />
    );
  }

  // Show the game
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
