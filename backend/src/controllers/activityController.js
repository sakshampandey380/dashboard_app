const asyncHandler = require("../utils/asyncHandler");
const { buildPagination } = require("../utils/query");
const { ROLES } = require("../constants");
const { query } = require("../config/db");
const { mapActivity } = require("../utils/mappers");

const listActivities = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const conditions = [];
  const params = [];

  if (req.user.role !== ROLES.ADMIN) {
    conditions.push("user_id = ?");
    params.push(req.user._id);
  }

  if (req.query.action && req.query.action !== "all") {
    conditions.push("action = ?");
    params.push(req.query.action);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT * FROM activities ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, skip]
  );
  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM activities ${whereClause}`,
    params
  );

  res.json({
    data: rows.map(mapActivity),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

module.exports = {
  listActivities,
};
