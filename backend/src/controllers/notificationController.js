const { body, param } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination } = require("../utils/query");
const { query } = require("../config/db");
const { mapNotification } = require("../utils/mappers");

const idValidator = [param("id").isInt({ min: 1 }).withMessage("Invalid notification id")];
const bulkValidators = [
  body("ids").isArray({ min: 1 }).withMessage("At least one notification is required"),
];

const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const conditions = ["user_id = ?"];
  const params = [req.user._id];

  if (req.query.filter === "read") {
    conditions.push("is_read = 1");
  }

  if (req.query.filter === "unread") {
    conditions.push("is_read = 0");
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const rows = await query(
    `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, skip]
  );
  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM notifications ${whereClause}`,
    params
  );
  const [{ unreadCount }] = await query(
    "SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0",
    [req.user._id]
  );

  res.json({
    data: rows.map(mapNotification),
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const result = await query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [req.params.id, req.user._id]
  );

  if (!result.affectedRows) {
    res.status(404);
    throw new Error("Notification not found");
  }

  const rows = await query("SELECT * FROM notifications WHERE id = ? LIMIT 1", [req.params.id]);
  res.json({ message: "Notification marked as read", notification: mapNotification(rows[0]) });
});

const markAllRead = asyncHandler(async (req, res) => {
  await query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user._id]);
  res.json({ message: "All notifications marked as read" });
});

const markManyRead = asyncHandler(async (req, res) => {
  const ids = req.body.ids || [];
  const placeholders = ids.map(() => "?").join(", ");
  await query(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`,
    [req.user._id, ...ids]
  );
  res.json({ message: "Selected notifications marked as read" });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const result = await query("DELETE FROM notifications WHERE id = ? AND user_id = ?", [
    req.params.id,
    req.user._id,
  ]);

  if (!result.affectedRows) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json({ message: "Notification deleted" });
});

const bulkDeleteNotifications = asyncHandler(async (req, res) => {
  const ids = req.body.ids || [];
  const placeholders = ids.map(() => "?").join(", ");
  await query(
    `DELETE FROM notifications WHERE user_id = ? AND id IN (${placeholders})`,
    [req.user._id, ...ids]
  );

  res.json({ message: "Selected notifications deleted" });
});

module.exports = {
  idValidator,
  bulkValidators,
  listNotifications,
  markNotificationRead,
  markAllRead,
  markManyRead,
  deleteNotification,
  bulkDeleteNotifications,
};
