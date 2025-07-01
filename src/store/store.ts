import { configureStore } from "@reduxjs/toolkit";
import PlayersSlice from "./PlayersSlice";
import TriggerSlice from "./TriggerSlice";
import TargetingSlice from "./TargetingSlice";

export const store = configureStore({
  reducer: {
    players: PlayersSlice,
    triggers: TriggerSlice,
    targeting: TargetingSlice,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
