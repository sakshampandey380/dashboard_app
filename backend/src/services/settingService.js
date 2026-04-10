const { query } = require("../config/db");
const { ROLES } = require("../constants");
const { mapSettings } = require("../utils/mappers");

const getSettings = async () => {
  const rows = await query("SELECT * FROM settings ORDER BY id ASC LIMIT 1");
  let settings = rows[0] ? mapSettings(rows[0]) : null;

  if (!settings) {
    const insertResult = await query(
      `INSERT INTO settings (app_name, logo_url, default_role, notifications_enabled, activity_tracking_enabled)
       VALUES (?, ?, ?, ?, ?)`,
      ["PulseBoard", "", ROLES.USER, 1, 1]
    );
    const createdRows = await query("SELECT * FROM settings WHERE id = ? LIMIT 1", [
      insertResult.insertId,
    ]);
    settings = mapSettings(createdRows[0]);
  }

  return settings;
};

const updateSettingsRecord = async ({
  id,
  appName,
  logoUrl,
  defaultRole,
  notificationsEnabled,
  activityTrackingEnabled,
}) => {
  await query(
    `UPDATE settings
     SET app_name = ?, logo_url = ?, default_role = ?, notifications_enabled = ?, activity_tracking_enabled = ?
     WHERE id = ?`,
    [appName, logoUrl, defaultRole, notificationsEnabled ? 1 : 0, activityTrackingEnabled ? 1 : 0, id]
  );

  const rows = await query("SELECT * FROM settings WHERE id = ? LIMIT 1", [id]);
  return mapSettings(rows[0]);
};

module.exports = {
  getSettings,
  updateSettingsRecord,
};
