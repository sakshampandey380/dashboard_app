import { createSlice } from "@reduxjs/toolkit";

const getStoredTheme = () => localStorage.getItem("pulseboard-theme") || "light";

const initialState = {
  mode: typeof window === "undefined" ? "light" : getStoredTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    initializeTheme: (state) => {
      state.mode = getStoredTheme();
    },
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("pulseboard-theme", state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("pulseboard-theme", action.payload);
    },
  },
});

export const { initializeTheme, toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
