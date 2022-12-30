import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface userState {
  isConnected: boolean;
  id: number;
  username: string;
  mail: string;
  accessToken: string;
  isAdmin: boolean;
  isValidated: boolean;
  isBannished: boolean;
  isSalesman: boolean;
  Nom: string;
  Prenom: string;
}

const initialState: userState = {
  isConnected: false,
  id: 0,
  username: "",
  accessToken: "",
  mail: "",
  isAdmin: false,
  isValidated: false,
  isBannished: false,
  isSalesman: false,
  Nom: "",
  Prenom: "",
};

export const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<userState>) => {
      state.isConnected = action.payload.isConnected;
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.mail = action.payload.mail;
      state.accessToken = action.payload.accessToken;
      state.isAdmin = action.payload.isAdmin;
      state.isValidated = action.payload.isValidated;
      state.isBannished = action.payload.isBannished;
      state.isSalesman = action.payload.isSalesman;
      state.Nom = action.payload.Nom;
      state.Prenom = action.payload.Prenom;
    },
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    setNom: (state, action: PayloadAction<string>) => {
      state.Nom = action.payload;
    },
    setPrenom: (state, action: PayloadAction<string>) => {
      state.Prenom = action.payload;
    },
    setMail: (state, action: PayloadAction<string>) => {
      state.mail = action.payload;
    },
  },
});

export const { setState, setAdmin, setNom, setPrenom, setMail } = user.actions;

export const fetchUser = (state: RootState) => state.user;
export const selectIsAdmin = (state: RootState) => state.user.isAdmin;
export const isConnected = (state: RootState) => state.user.isConnected;
export const selectUsername = (state: RootState) => state.user.username;
export const selectUserId = (state: RootState) => state.user.id;

export default user.reducer;
