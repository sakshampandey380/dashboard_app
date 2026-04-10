import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCurrentUserRequest,
  loginUserRequest,
  logoutRequest,
  registerUserRequest,
} from "./authapi";
import { addToast } from "../../app/uiSlice";
import { decodeToken, isTokenExpired } from "../../units/helpers";

const tokenKey = "pulseboard-token";
const rememberKey = "pulseboard-remember";

const initialState = {
  user: null,
  token: localStorage.getItem(tokenKey),
  status: "idle",
  isBootstrapped: false,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await loginUserRequest(payload);
      localStorage.setItem(tokenKey, data.token);
      localStorage.setItem(rememberKey, payload.rememberMe ? "true" : "false");
      dispatch(
        addToast({
          type: "success",
          title: "Welcome back",
          message: `Signed in as ${data.user.name}.`,
        })
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await registerUserRequest(payload);
      dispatch(
        addToast({
          type: "success",
          title: "Account created",
          message: data.message,
        })
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrapAuth",
  async (_, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem(tokenKey);
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem(tokenKey);
      return rejectWithValue("No active session");
    }

    try {
      const data = await getCurrentUserRequest();
      return { token, user: data.user };
    } catch (error) {
      dispatch(forceLogout());
      return rejectWithValue("Session expired");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { dispatch }) => {
  try {
    await logoutRequest();
  } catch (error) {
    // Ignore network failures on logout so the client can still clear session data.
  }
  dispatch(forceLogout());
  dispatch(
    addToast({
      type: "info",
      title: "Logged out",
      message: "Your session has ended.",
    })
  );
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.isBootstrapped = true;
      localStorage.removeItem(tokenKey);
      if (localStorage.getItem(rememberKey) !== "true") {
        sessionStorage.removeItem(tokenKey);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isBootstrapped = true;
      })
      .addCase(loginUser.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = "succeeded";
        state.isBootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
        state.isBootstrapped = true;
      });
  },
});

export const { setUser, forceLogout } = authSlice.actions;
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.token && state.auth.user && !isTokenExpired(state.auth.token));
export const selectUserRole = (state) =>
  state.auth.user?.role || decodeToken(state.auth.token)?.role;
export default authSlice.reducer;
