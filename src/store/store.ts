import { configureStore } from "@reduxjs/toolkit";
import PlayersSlice from "./PlayersSlice";
import TriggerSlice from "./TriggerSlice";

export const store = configureStore({
  reducer: {
    players: PlayersSlice,
    triggers: TriggerSlice,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
