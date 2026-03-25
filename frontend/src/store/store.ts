import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    // 1. The RTK Query network cache
    [apiSlice.reducerPath]: apiSlice.reducer,
    // 2. The global Auth Slice (user profile)
    auth: authReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Standard Redux TypeScript definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
