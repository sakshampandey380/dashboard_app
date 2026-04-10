const { getSettings } = require("./settingService");
const { query } = require("../config/db");

const createActivity = async (payload) => {
  const settings = await getSettings();

  if (!settings.activityTrackingEnabled) {
    return null;
  }

  return query(
    `INSERT INTO activities (user_id, user_name, action, target, target_id, target_name, ip, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.userId,
      payload.userName,
      payload.action,
      payload.target,
      payload.targetId || "",
      payload.targetName || "",
      payload.ip || "",
      payload.timestamp || new Date(),
    ]
  );
};

module.exports = {
  createActivity,
};
