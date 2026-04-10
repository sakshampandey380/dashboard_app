import { createSlice, nanoid } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    toasts: [],
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
  },
  reducers: {
    addToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload);
      },
      prepare: (toast) => ({
        payload: {
          id: nanoid(),
          duration: 4000,
          ...toast,
        },
      }),
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },
  },
});

export const { addToast, removeToast, toggleSidebar, setMobileSidebarOpen } =
  uiSlice.actions;
export default uiSlice.reducer;
