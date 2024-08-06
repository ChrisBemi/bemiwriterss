import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("isAuthenticated");
    }
    
  },
});

export const { setUser, clearUser, loadUserFromStorage } = authSlice.actions;
export default authSlice;
