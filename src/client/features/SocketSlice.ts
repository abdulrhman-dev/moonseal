import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    isConnected: false,
  },
  reducers: {
    initSocket() {
      return;
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
    },
    connectionLost: (state) => {
      state.isConnected = false;
    },
  },
});

export default socketSlice.reducer;
export const { initSocket, connectionEstablished, connectionLost } =
  socketSlice.actions;
