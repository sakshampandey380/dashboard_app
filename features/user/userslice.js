import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  bulkDeleteUsersRequest,
  createUserRequest,
  deleteUserRequest,
  fetchUsersRequest,
  toggleUserStatusRequest,
  updateUserRequest,
} from "./userapi";
import { addToast } from "../../app/uiSlice";

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (params = {}) =>
  fetchUsersRequest(params)
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload, { dispatch }) => {
    const data = await createUserRequest(payload);
    dispatch(addToast({ type: "success", title: "User created", message: data.message }));
    return data;
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, payload }, { dispatch }) => {
    const data = await updateUserRequest(id, payload);
    dispatch(addToast({ type: "success", title: "User updated", message: data.message }));
    return data;
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { dispatch }) => {
    const data = await deleteUserRequest(id);
    dispatch(addToast({ type: "success", title: "User deleted", message: data.message }));
    return { ...data, id };
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async (id, { dispatch }) => {
    const data = await toggleUserStatusRequest(id);
    dispatch(addToast({ type: "success", title: "Status updated", message: data.message }));
    return data;
  }
);

export const bulkDeleteUsers = createAsyncThunk(
  "users/bulkDelete",
  async (ids, { dispatch }) => {
    const data = await bulkDeleteUsersRequest(ids);
    dispatch(addToast({ type: "success", title: "Users deleted", message: data.message }));
    return ids;
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    data: [],
    pagination: { page: 1, pages: 1, total: 0 },
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.data = state.data.map((item) =>
          item._id === action.payload.user._id ? action.payload.user : item
        );
      });
  },
});

export default usersSlice.reducer;
