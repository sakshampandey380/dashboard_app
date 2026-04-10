import axios from "axios";
import { API_URL } from "../units/constants";
import { addToast } from "../app/uiSlice";
import { forceLogout } from "../features/auth/authslice";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

let storeRef;

export const injectStore = (store) => {
  storeRef = store;
};

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("pulseboard-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      "Something went wrong. Please try again.";

    if (error.response?.status === 401) {
      storeRef?.dispatch(forceLogout());
      window.location.href = "/login";
    } else {
      storeRef?.dispatch(
        addToast({
          type: "error",
          title: "Request failed",
          message,
        })
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
