const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

const ACTIVITY_ACTIONS = {
  AUTH: "auth",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

module.exports = {
  ROLES,
  USER_STATUS,
  PRODUCT_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  NOTIFICATION_TYPES,
  ACTIVITY_ACTIONS,
};
