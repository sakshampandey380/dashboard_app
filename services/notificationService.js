import axiosInstance from "./axiosInstance";

export const getNotifications = (params) =>
  axiosInstance.get("/notifications", { params }).then((response) => response.data);

export const markNotificationRead = (id) =>
  axiosInstance.put(`/notifications/${id}/read`).then((response) => response.data);

export const markAllNotificationsRead = () =>
  axiosInstance.put("/notifications/mark-all-read").then((response) => response.data);

export const markManyNotificationsRead = (ids) =>
  axiosInstance.put("/notifications/read-many", { ids }).then((response) => response.data);

export const deleteNotification = (id) =>
  axiosInstance.delete(`/notifications/${id}`).then((response) => response.data);

export const bulkDeleteNotifications = (ids) =>
  axiosInstance.post("/notifications/bulk-delete", { ids }).then((response) => response.data);
