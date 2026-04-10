import axiosInstance from "./axiosInstance";

export const getSettings = () =>
  axiosInstance.get("/settings").then((response) => response.data);

export const updateSettings = (payload) =>
  axiosInstance.put("/settings", payload).then((response) => response.data);
