const { body, param } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, escapeRegExp } = require("../utils/query");
const { TASK_PRIORITY, TASK_STATUS, ROLES, ACTIVITY_ACTIONS, NOTIFICATION_TYPES } = require("../constants");
const { createNotification } = require("../services/notificationService");
const { query } = require("../config/db");
const { mapTask } = require("../utils/mappers");

const taskValidators = [
  body("title").trim().notEmpty().withMessage("Task title is required"),
  body("assignedTo").isInt({ min: 1 }).withMessage("Assigned user is required"),
  body("priority").optional().isIn(Object.values(TASK_PRIORITY)).withMessage("Invalid priority"),
  body("status").optional().isIn(Object.values(TASK_STATUS)).withMessage("Invalid status"),
  body("dueDate").isISO8601().withMessage("Valid due date is required"),
];

const idValidator = [param("id").isInt({ min: 1 }).withMessage("Invalid record id")];

const SORT_FIELDS = {
  title: "t.title",
  priority: "t.priority",
  status: "t.status",
  dueDate: "t.due_date",
  due_date: "t.due_date",
  createdAt: "t.created_at",
  created_at: "t.created_at",
};

const maybeNotifyDueSoon = async (task) => {
  const dueAt = new Date(task.dueDate).getTime();
  const now = Date.now();

  if (dueAt - now <= 24 * 60 * 60 * 1000 && dueAt > now) {
    await createNotification({
      userId: task.assignedTo?._id || task.assignedTo,
      title: "Task due soon",
      message: `${task.title} is due within 24 hours.`,
      type: NOTIFICATION_TYPES.WARNING,
    });
  }
};

const buildTaskWhere = (req) => {
  const conditions = [];
  const params = [];

  if (req.user.role !== ROLES.ADMIN) {
    conditions.push("t.assigned_to = ?");
    params.push(req.user._id);
  }

  if (req.query.priority) {
    conditions.push("t.priority = ?");
    params.push(req.query.priority);
  }

  if (req.query.status) {
    conditions.push("t.status = ?");
    params.push(req.query.status);
  }

  if (req.query.assignedTo) {
    conditions.push("t.assigned_to = ?");
    params.push(req.query.assignedTo);
  }

  if (req.query.search) {
    conditions.push("t.title LIKE ?");
    params.push(`%${escapeRegExp(req.query.search)}%`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
};

const baseTaskSelect = `
  SELECT
    t.*,
    u.id AS assigned_user_id,
    u.name AS assigned_user_name,
    u.email AS assigned_user_email,
    u.avatar AS assigned_user_avatar
  FROM tasks t
  LEFT JOIN users u ON u.id = t.assigned_to
`;

const listTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const sortField = SORT_FIELDS[req.query.sortBy] || "t.created_at";
  const sortOrder = req.query.sortOrder === "asc" ? "ASC" : "DESC";
  const { whereClause, params } = buildTaskWhere(req);

  const rows = await query(
    `${baseTaskSelect} ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, limit, skip]
  );
  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM tasks t ${whereClause}`,
    params
  );

  res.json({
    data: rows.map(mapTask),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const extraCondition = req.user.role === ROLES.ADMIN ? "" : "AND t.assigned_to = ?";
  const params = req.user.role === ROLES.ADMIN ? [req.params.id] : [req.params.id, req.user._id];
  const rows = await query(
    `${baseTaskSelect} WHERE t.id = ? ${extraCondition} LIMIT 1`,
    params
  );
  const task = rows[0] ? mapTask(rows[0]) : null;

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.json({ task });
});

const createTask = asyncHandler(async (req, res) => {
  const assignee = req.user.role === ROLES.ADMIN ? req.body.assignedTo : req.user._id;
  const result = await query(
    `INSERT INTO tasks (title, description, assigned_to, priority, status, due_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      req.body.title.trim(),
      req.body.description?.trim() || "",
      assignee,
      req.body.priority || TASK_PRIORITY.MEDIUM,
      req.body.status || TASK_STATUS.TODO,
      req.body.dueDate,
    ]
  );

  const rows = await query(`${baseTaskSelect} WHERE t.id = ? LIMIT 1`, [result.insertId]);
  const task = mapTask(rows[0]);
  await maybeNotifyDueSoon(task);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.CREATE,
    target: "task",
    targetId: String(task._id),
    targetName: task.title,
  };

  res.status(201).json({ message: "Task created successfully", task });
});

const updateTask = asyncHandler(async (req, res) => {
  const currentRows = await query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [req.params.id]);
  const currentTask = currentRows[0];

  if (!currentTask) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (req.user.role !== ROLES.ADMIN && Number(currentTask.assigned_to) !== Number(req.user._id)) {
    return res.status(403).json({ message: "You do not have permission to update this task." });
  }

  const nextAssignedTo =
    req.user.role === ROLES.ADMIN && req.body.assignedTo ? req.body.assignedTo : currentTask.assigned_to;

  await query(
    `UPDATE tasks
     SET title = ?, description = ?, assigned_to = ?, priority = ?, status = ?, due_date = ?
     WHERE id = ?`,
    [
      req.body.title?.trim() || currentTask.title,
      req.body.description?.trim() ?? currentTask.description,
      nextAssignedTo,
      req.body.priority || currentTask.priority,
      req.body.status || currentTask.status,
      req.body.dueDate || currentTask.due_date,
      req.params.id,
    ]
  );

  const rows = await query(`${baseTaskSelect} WHERE t.id = ? LIMIT 1`, [req.params.id]);
  const task = mapTask(rows[0]);
  await maybeNotifyDueSoon(task);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "task",
    targetId: String(task._id),
    targetName: task.title,
  };

  res.json({ message: "Task updated successfully", task });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const currentRows = await query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [req.params.id]);
  const currentTask = currentRows[0];

  if (!currentTask) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (req.user.role !== ROLES.ADMIN && Number(currentTask.assigned_to) !== Number(req.user._id)) {
    return res.status(403).json({ message: "You do not have permission to update this task." });
  }

  await query("UPDATE tasks SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
  const rows = await query(`${baseTaskSelect} WHERE t.id = ? LIMIT 1`, [req.params.id]);
  const task = mapTask(rows[0]);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "task",
    targetId: String(task._id),
    targetName: `${task.title} moved to ${task.status}`,
  };

  res.json({ message: "Task status updated successfully", task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const rows = await query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [req.params.id]);
  const taskRow = rows[0];

  if (!taskRow) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (req.user.role !== ROLES.ADMIN && Number(taskRow.assigned_to) !== Number(req.user._id)) {
    return res.status(403).json({ message: "You do not have permission to delete this task." });
  }

  await query("DELETE FROM tasks WHERE id = ?", [req.params.id]);

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.DELETE,
    target: "task",
    targetId: String(req.params.id),
    targetName: taskRow.title,
  };

  res.json({ message: "Task deleted successfully" });
});

const bulkDeleteTasks = asyncHandler(async (req, res) => {
  const ids = req.body.ids || [];
  if (!ids.length) {
    return res.json({ message: "No tasks selected" });
  }

  const placeholders = ids.map(() => "?").join(", ");

  if (req.user.role !== ROLES.ADMIN) {
    const ownedRows = await query(
      `SELECT id FROM tasks WHERE assigned_to = ? AND id IN (${placeholders})`,
      [req.user._id, ...ids]
    );
    const ownedIds = ownedRows.map((row) => row.id);

    if (!ownedIds.length) {
      return res.json({ message: "No tasks selected" });
    }

    const ownedPlaceholders = ownedIds.map(() => "?").join(", ");
    await query(`DELETE FROM tasks WHERE id IN (${ownedPlaceholders})`, ownedIds);
  } else {
    await query(`DELETE FROM tasks WHERE id IN (${placeholders})`, ids);
  }

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.DELETE,
    target: "task",
    targetId: ids.join(","),
    targetName: `${ids.length} tasks removed`,
  };

  res.json({ message: "Selected tasks deleted successfully" });
});

module.exports = {
  taskValidators,
  idValidator,
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  bulkDeleteTasks,
};
