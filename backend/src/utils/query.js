const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildPagination = (reqQuery) => {
  const page = Math.max(Number(reqQuery.page) || 1, 1);
  const limit = Math.min(Math.max(Number(reqQuery.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildSort = (reqQuery, fallback = "-createdAt") => {
  if (!reqQuery.sortBy) {
    return fallback;
  }

  const direction = reqQuery.sortOrder === "asc" ? "" : "-";
  return `${direction}${reqQuery.sortBy}`;
};

module.exports = {
  escapeRegExp,
  buildPagination,
  buildSort,
};
