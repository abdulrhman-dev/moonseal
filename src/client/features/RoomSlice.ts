import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Player } from "@backend/types/socket";

interface RoomState {
  username: string | null;
  roomCode: string | null;
  playerNum: number | null;
  players: Player[];
  isLeader: boolean;
  gameStarted: boolean;
  error: string | null;
}

const initialState: RoomState = {
  username: null,
  roomCode: null,
  playerNum: null,
  players: [],
  isLeader: false,
  gameStarted: false,
  error: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    roomCreated: (
      state,
      action: PayloadAction<{
        code: string;
        playerNum: number;
        players: Player[];
      }>,
    ) => {
      state.roomCode = action.payload.code;
      state.playerNum = action.payload.playerNum;
      state.players = action.payload.players;
      state.isLeader = true;
      state.error = null;
    },
    roomJoined: (
      state,
      action: PayloadAction<{
        players: Player[];
        playerNum: number;
        code: string;
      }>,
    ) => {
      state.roomCode = action.payload.code;
      state.playerNum = action.payload.playerNum;
      state.players = action.payload.players;
      state.isLeader = false;
      state.error = null;
    },
    playerJoined: (state, action: PayloadAction<{ players: Player[] }>) => {
      state.players = action.payload.players;
    },
    playerLeft: (state, action: PayloadAction<{ players: Player[] }>) => {
      state.players = action.payload.players;
    },
    gameStarted: (state) => {
      state.gameStarted = true;
    },
    roomError: (state, action: PayloadAction<{ message: string }>) => {
      state.error = action.payload.message;
    },
    resetRoom: (state) => {
      state.roomCode = null;
      state.playerNum = null;
      state.players = [];
      state.isLeader = false;
      state.gameStarted = false;
      state.error = null;
    },
    returnToRoom: (state) => {
      state.gameStarted = false;
    },
  },
});

export const {
  setUsername,
  roomCreated,
  roomJoined,
  playerJoined,
  playerLeft,
  gameStarted,
  roomError,
  resetRoom,
  returnToRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
