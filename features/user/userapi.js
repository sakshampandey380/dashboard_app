import axiosInstance from "../../services/axiosInstance";

export const fetchUsersRequest = (params) =>
  axiosInstance.get("/users", { params }).then((response) => response.data);

export const createUserRequest = (payload) =>
  axiosInstance.post("/users", payload).then((response) => response.data);

export const updateUserRequest = (id, payload) =>
  axiosInstance.put(`/users/${id}`, payload).then((response) => response.data);

export const deleteUserRequest = (id) =>
  axiosInstance.delete(`/users/${id}`).then((response) => response.data);

export const toggleUserStatusRequest = (id) =>
  axiosInstance.patch(`/users/${id}/status`).then((response) => response.data);

export const bulkDeleteUsersRequest = (ids) =>
  axiosInstance.post("/users/bulk-delete", { ids }).then((response) => response.data);

export const updateProfileRequest = (payload) =>
  axiosInstance.put("/users/profile/me", payload).then((response) => response.data);

export const changePasswordRequest = (payload) =>
  axiosInstance.put("/users/profile/change-password", payload).then((response) => response.data);
