import axiosInstance from "./axiosInstance";

export const getProducts = (params) =>
  axiosInstance.get("/products", { params }).then((response) => response.data);

export const getProductById = (id) =>
  axiosInstance.get(`/products/${id}`).then((response) => response.data);

export const createProduct = (payload) =>
  axiosInstance.post("/products", payload).then((response) => response.data);

export const updateProduct = (id, payload) =>
  axiosInstance.put(`/products/${id}`, payload).then((response) => response.data);

export const deleteProduct = (id) =>
  axiosInstance.delete(`/products/${id}`).then((response) => response.data);

export const bulkDeleteProducts = (ids) =>
  axiosInstance.post("/products/bulk-delete", { ids }).then((response) => response.data);
