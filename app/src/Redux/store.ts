import { configureStore } from "@reduxjs/toolkit";
import userStateReducer from "./States/users";
import userConnectedReducer from "./States/usersConnected";

export let store = configureStore({
  reducer: {
    user: userStateReducer,
    userConnected: userConnectedReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
