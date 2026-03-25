import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../api"; // Temporarily reusing types from existing file

interface AuthState {
  user: User | null;
  token: string | null;
  isInitializing: boolean; 
}

const initialState: AuthState = {
  user: null,
  token: null,
  isInitializing: true, // Used by App.tsx to know if we are still checking the hard drive
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called when a user logs in, signs up, or is loaded from the hard drive on boot
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isInitializing = false;
    },
    // Called when the user clicks 'Logout' or if their session completely expires
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitializing = false;
    },
    // Called if the app boots up and finds NO saved token on the phone
    setInitialized: (state) => {
      state.isInitializing = false;
    }
  },
});

export const { setCredentials, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;
