import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state,action) {
      state.user = action.payload
    },

    updateUserData(state, action) {
      state.user = action.payload;
    },
  },
});

export const { setUser, updateUserData } = UserSlice.actions;

export default UserSlice;
