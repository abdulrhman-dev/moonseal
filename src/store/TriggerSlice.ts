import type { Triggers } from "@/types/triggers";
import { createSlice } from "@reduxjs/toolkit";

type TriggerState = {
  [Trigger in Triggers as `${Trigger[0]}`]: ((args: Trigger[1]) => void)[];
};

const initialState: TriggerState = {
  CARD_TAP: [],
};

const triggerSlice = createSlice({
  name: "trigger",
  initialState,
  reducers: {},
});

export default triggerSlice.reducer;
// export cosnt {} = triggerSlice.actions
