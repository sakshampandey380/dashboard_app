import axiosInstance from "../../services/axiosInstance";

export const registerUserRequest = (payload) =>
  axiosInstance.post("/auth/register", payload).then((response) => response.data);

export const loginUserRequest = (payload) =>
  axiosInstance.post("/auth/login", payload).then((response) => response.data);

export const getCurrentUserRequest = () =>
  axiosInstance.get("/auth/me").then((response) => response.data);

export const logoutRequest = () =>
  axiosInstance.post("/auth/logout").then((response) => response.data);
