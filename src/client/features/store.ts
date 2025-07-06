import {
  configureStore,
  createListenerMiddleware,
  type TypedStartListening,
} from "@reduxjs/toolkit";
import PlayersSlice from "./GameSlice";
import TriggerSlice from "./TriggerSlice";
import TargetingSlice from "./TargetingSlice";
import socketMiddleware from "./socket/SocketMiddleware";

// const listener = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    game: PlayersSlice,
    triggers: TriggerSlice,
    targeting: TargetingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
  // getDefaultMiddleware().prepend(listener.middleware),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
