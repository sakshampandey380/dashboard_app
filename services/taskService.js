import axiosInstance from "./axiosInstance";

export const getTasks = (params) =>
  axiosInstance.get("/tasks", { params }).then((response) => response.data);

export const createTask = (payload) =>
  axiosInstance.post("/tasks", payload).then((response) => response.data);

export const updateTask = (id, payload) =>
  axiosInstance.put(`/tasks/${id}`, payload).then((response) => response.data);

export const updateTaskStatus = (id, status) =>
  axiosInstance.put(`/tasks/${id}/status`, { status }).then((response) => response.data);

export const deleteTask = (id) =>
  axiosInstance.delete(`/tasks/${id}`).then((response) => response.data);

export const bulkDeleteTasks = (ids) =>
  axiosInstance.post("/tasks/bulk-delete", { ids }).then((response) => response.data);
