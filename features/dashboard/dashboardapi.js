import axiosInstance from "../../services/axiosInstance";

export const fetchDashboardSummaryRequest = () =>
  axiosInstance.get("/analytics/summary").then((response) => response.data);

export const fetchDashboardChartsRequest = (range = "1y") =>
  axiosInstance.get(`/analytics/charts?range=${range}`).then((response) => response.data);
