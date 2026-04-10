import axiosInstance from "./axiosInstance";

export const getActivities = (params) =>
  axiosInstance.get("/activities", { params }).then((response) => response.data);
