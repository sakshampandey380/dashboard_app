const { ROLES, NOTIFICATION_TYPES } = require("../constants");
const { getSettings } = require("./settingService");
const { query } = require("../config/db");

const createNotification = async ({ userId, title, message, type }) => {
  const settings = await getSettings();

  if (!settings.notificationsEnabled) {
    return null;
  }

  const result = await query(
    "INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)",
    [userId, title, message, type, 0]
  );

  return { id: result.insertId, userId, title, message, type, isRead: false };
};

const notifyAdmins = async ({ title, message, type = NOTIFICATION_TYPES.INFO }) => {
  const admins = await query("SELECT id FROM users WHERE role = ?", [ROLES.ADMIN]);
  if (!admins.length) {
    return [];
  }

  return Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title,
        message,
        type,
      })
    )
  );
};

module.exports = {
  createNotification,
  notifyAdmins,
};
