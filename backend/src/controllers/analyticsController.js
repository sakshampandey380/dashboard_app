const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../constants");
const { query } = require("../config/db");
const { mapActivity } = require("../utils/mappers");

const getDateRange = (range = "1y") => {
  const end = new Date();
  const start = new Date();
  const rangeMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  start.setDate(end.getDate() - (rangeMap[range] || 365));
  return { start, end };
};

const summary = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === ROLES.ADMIN;

  const [
    totalUsersRows,
    totalProductsRows,
    activeTasksRows,
    totalRevenueRows,
    recentActivitiesRows,
    unreadNotificationsRows,
  ] = await Promise.all([
    query("SELECT COUNT(*) AS totalUsers FROM users"),
    query("SELECT COUNT(*) AS totalProducts FROM products"),
    query(
      isAdmin
        ? "SELECT COUNT(*) AS activeTasks FROM tasks WHERE status <> 'done'"
        : "SELECT COUNT(*) AS activeTasks FROM tasks WHERE assigned_to = ? AND status <> 'done'",
      isAdmin ? [] : [req.user._id]
    ),
    query("SELECT COALESCE(SUM(price * stock), 0) AS totalRevenue FROM products"),
    query(
      isAdmin
        ? "SELECT * FROM activities ORDER BY created_at DESC LIMIT 10"
        : "SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      isAdmin ? [] : [req.user._id]
    ),
    query(
      "SELECT COUNT(*) AS unreadNotifications FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user._id]
    ),
  ]);

  res.json({
    summary: {
      totalUsers: totalUsersRows[0].totalUsers,
      totalProducts: totalProductsRows[0].totalProducts,
      activeTasks: activeTasksRows[0].activeTasks,
      totalRevenue: Number(totalRevenueRows[0].totalRevenue || 0),
      unreadNotifications: unreadNotificationsRows[0].unreadNotifications,
    },
    recentActivities: recentActivitiesRows.map(mapActivity),
  });
});

const charts = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.range);
  const params = [start, end];

  const [productsByCategory, userRegistrations, taskStatus, monthlyRevenue] = await Promise.all([
    query(
      `SELECT category, COUNT(*) AS value
       FROM products
       WHERE created_at BETWEEN ? AND ?
       GROUP BY category
       ORDER BY value DESC`,
      params
    ),
    query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS value
       FROM users
       WHERE created_at BETWEEN ? AND ?
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      params
    ),
    query(
      req.user.role === ROLES.ADMIN
        ? `SELECT status, COUNT(*) AS value FROM tasks GROUP BY status`
        : `SELECT status, COUNT(*) AS value FROM tasks WHERE assigned_to = ? GROUP BY status`,
      req.user.role === ROLES.ADMIN ? [] : [req.user._id]
    ),
    query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COALESCE(SUM(price * stock), 0) AS value
       FROM products
       WHERE created_at BETWEEN ? AND ?
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      params
    ),
  ]);

  res.json({
    range: req.query.range || "1y",
    charts: {
      monthlyRevenue: monthlyRevenue.map((item) => ({
        month: item.month,
        value: Number(item.value),
      })),
      productsByCategory: productsByCategory.map((item) => ({
        category: item.category || "Uncategorized",
        value: Number(item.value),
      })),
      userRegistrations: userRegistrations.map((item) => ({
        month: item.month,
        value: Number(item.value),
      })),
      taskStatus: taskStatus.map((item) => ({
        status: item.status,
        value: Number(item.value),
      })),
    },
  });
});

module.exports = {
  summary,
  charts,
};
