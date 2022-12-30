import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store";

interface userState {
  userID: string;
  username: number;
}

const initialState: { users: userState[] } = { users: [] };

export const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserCo: (state, action: PayloadAction<userState[]>) => {
      state.users = action.payload;
    },
  },
});

export const { setUserCo } = user.actions;

export const fetchUsersConnected = (state: RootState) =>
  state.userConnected.users;

export default user.reducer;
