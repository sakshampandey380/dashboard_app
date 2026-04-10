import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authslice";
import dashboardReducer from "../features/dashboard/dashboardslice";
import userReducer from "../features/user/userslice";
import themeReducer from "./themeSlice";
import uiReducer from "./uiSlice";
import { injectStore } from "../services/axiosInstance";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: userReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
});

injectStore(store);

export default store;
