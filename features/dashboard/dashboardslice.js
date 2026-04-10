import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchDashboardChartsRequest, fetchDashboardSummaryRequest } from "./dashboardapi";

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async () => fetchDashboardSummaryRequest()
);

export const fetchDashboardCharts = createAsyncThunk(
  "dashboard/fetchCharts",
  async (range = "1y") => fetchDashboardChartsRequest(range)
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    summary: null,
    charts: null,
    recentActivities: [],
    range: "1y",
    status: "idle",
  },
  reducers: {
    setRange: (state, action) => {
      state.range = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.summary = action.payload.summary;
        state.recentActivities = action.payload.recentActivities;
        state.status = "succeeded";
      })
      .addCase(fetchDashboardCharts.fulfilled, (state, action) => {
        state.charts = action.payload.charts;
      });
  },
});

export const { setRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;
