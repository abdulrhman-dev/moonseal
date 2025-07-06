import {
  configureStore,
  createListenerMiddleware,
  type TypedStartListening,
} from "@reduxjs/toolkit";
import PlayersSlice from "./PlayersSlice";
import TriggerSlice from "./TriggerSlice";
import TargetingSlice from "./TargetingSlice";
import { setupListeners } from "./listeners/index";

const listener = createListenerMiddleware();

export const StartAppListening = listener.startListening as TypedStartListening<
  RootState,
  AppDispatch
>;

export const store = configureStore({
  reducer: {
    players: PlayersSlice,
    triggers: TriggerSlice,
    targeting: TargetingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listener.middleware),
  // getDefaultMiddleware().prepend(listener.middleware),
});

setupListeners();

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
