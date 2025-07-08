import {
  configureStore,
  createListenerMiddleware,
  type TypedStartListening,
} from "@reduxjs/toolkit";
import PlayersSlice from "./GameSlice";
import TargetingSlice from "./TargetingSlice";
import socketMiddleware from "./socket/SocketMiddleware";
import setupListeners from "./listeners/setup";

const listener = createListenerMiddleware();

export const startAppListening = listener.startListening as TypedStartListening<
  RootState,
  AppDispatch
>;

export const store = configureStore({
  reducer: {
    game: PlayersSlice,
    targeting: TargetingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(socketMiddleware)
      .prepend(listener.middleware),
});

setupListeners();

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
