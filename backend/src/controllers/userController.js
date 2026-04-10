const { body, param } = require("express-validator");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, escapeRegExp } = require("../utils/query");
const { ROLES, USER_STATUS, ACTIVITY_ACTIONS } = require("../constants");
const { createNotification, notifyAdmins } = require("../services/notificationService");
const { query } = require("../config/db");
const { mapUser } = require("../utils/mappers");

const userValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("role").optional().isIn(Object.values(ROLES)).withMessage("Invalid role"),
  body("status").optional().isIn(Object.values(USER_STATUS)).withMessage("Invalid status"),
  body("password")
    .optional({ values: "falsy" })
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const idValidator = [param("id").isInt({ min: 1 }).withMessage("Invalid record id")];

const SORT_FIELDS = {
  name: "name",
  email: "email",
  role: "role",
  createdAt: "created_at",
  created_at: "created_at",
};

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const sortField = SORT_FIELDS[req.query.sortBy] || "created_at";
  const sortOrder = req.query.sortOrder === "asc" ? "ASC" : "DESC";
  const conditions = [];
  const params = [];

  if (req.query.role) {
    conditions.push("role = ?");
    params.push(req.query.role);
  }

  if (req.query.status) {
    conditions.push("status = ?");
    params.push(req.query.status);
  }

  if (req.query.search) {
    const pattern = `%${escapeRegExp(req.query.search)}%`;
    conditions.push("(name LIKE ? OR email LIKE ?)");
    params.push(pattern, pattern);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query(
    `SELECT * FROM users ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, limit, skip]
  );
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM users ${whereClause}`, params);

  res.json({
    data: rows.map((row) => {
      const user = mapUser(row);
      delete user.password;
      return user;
    }),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const isSelf = String(req.user._id) === String(req.params.id);

  if (!isSelf && req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      message: "You do not have permission to view this profile.",
    });
  }

  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const user = rows[0] ? mapUser(rows[0]) : null;
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  delete user.password;
  return res.json({ user });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, status, avatar = "" } = req.body;
  const existingUsers = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

  if (existingUsers.length) {
    res.status(400);
    throw new Error("User already exists with this email.");
  }

  const hashedPassword = await bcrypt.hash(password || "Password@123", 12);
  const result = await query(
    "INSERT INTO users (name, email, password, role, status, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
    [name.trim(), email, hashedPassword, role || ROLES.USER, status || USER_STATUS.ACTIVE, avatar.trim()]
  );
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [result.insertId]);
  const user = mapUser(rows[0]);

  await notifyAdmins({
    title: "User created",
    message: `${user.name} was added by ${req.user.name}.`,
  });

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.CREATE,
    target: "user",
    targetId: String(user._id),
    targetName: user.name,
  };

  delete user.password;
  res.status(201).json({
    message: "User created successfully",
    user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const user = rows[0] ? mapUser(rows[0]) : null;
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const previousRole = user.role;
  const hashedPassword = req.body.password ? await bcrypt.hash(req.body.password, 12) : user.password;

  await query(
    `UPDATE users
     SET name = ?, email = ?, password = ?, role = ?, status = ?, avatar = ?
     WHERE id = ?`,
    [
      req.body.name?.trim() || user.name,
      req.body.email || user.email,
      hashedPassword,
      req.body.role || user.role,
      req.body.status || user.status,
      req.body.avatar?.trim() ?? user.avatar,
      req.params.id,
    ]
  );

  const updatedRows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const updatedUser = mapUser(updatedRows[0]);

  if (previousRole !== updatedUser.role) {
    await createNotification({
      userId: updatedUser._id,
      title: "Role changed",
      message: `Your role was updated from ${previousRole} to ${updatedUser.role}.`,
      type: "warning",
    });
  }

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "user",
    targetId: String(updatedUser._id),
    targetName: updatedUser.name,
  };

  delete updatedUser.password;
  res.json({
    message: "User updated successfully",
    user: updatedUser,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  await query("UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?", [
    req.body.name?.trim() || req.user.name,
    req.body.email || req.user.email,
    req.body.avatar?.trim() ?? req.user.avatar,
    req.user._id,
  ]);

  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.user._id]);
  const user = mapUser(rows[0]);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "profile",
    targetId: String(user._id),
    targetName: user.name,
  };

  delete user.password;
  res.json({
    message: "Profile updated successfully",
    user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.user._id]);
  const user = rows[0] ? mapUser(rows[0]) : null;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("All password fields are required.");
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("New passwords do not match.");
  }

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    res.status(400);
    throw new Error("Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user._id]);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "profile",
    targetId: String(req.user._id),
    targetName: `${req.user.name} changed password`,
  };

  res.json({ message: "Password changed successfully" });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const user = rows[0] ? mapUser(rows[0]) : null;
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const nextStatus =
    user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
  await query("UPDATE users SET status = ? WHERE id = ?", [nextStatus, req.params.id]);

  const updatedRows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const updatedUser = mapUser(updatedRows[0]);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "user",
    targetId: String(updatedUser._id),
    targetName: `${updatedUser.name} status changed`,
  };

  delete updatedUser.password;
  res.json({ message: "User status updated", user: updatedUser });
});

const deleteUser = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const user = rows[0] ? mapUser(rows[0]) : null;
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await query("DELETE FROM notifications WHERE user_id = ?", [req.params.id]);
  await query("DELETE FROM users WHERE id = ?", [req.params.id]);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.DELETE,
    target: "user",
    targetId: String(req.params.id),
    targetName: user.name,
  };

  res.json({ message: "User deleted successfully" });
});

const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const ids = req.body.ids || [];
  if (!ids.length) {
    return res.json({ message: "No users selected" });
  }

  const placeholders = ids.map(() => "?").join(", ");
  await query(`DELETE FROM notifications WHERE user_id IN (${placeholders})`, ids);
  await query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.DELETE,
    target: "user",
    targetId: ids.join(","),
    targetName: `${ids.length} users removed`,
  };

  res.json({ message: "Selected users deleted successfully" });
});

module.exports = {
  userValidators,
  idValidator,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  changePassword,
  toggleUserStatus,
  deleteUser,
  bulkDeleteUsers,
};
