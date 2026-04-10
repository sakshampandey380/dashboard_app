const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { getSettings, updateSettingsRecord } = require("../services/settingService");
const { ROLES, ACTIVITY_ACTIONS } = require("../constants");

const settingsValidators = [
  body("appName").trim().notEmpty().withMessage("App name is required"),
  body("defaultRole").isIn(Object.values(ROLES)).withMessage("Invalid default role"),
  body("notificationsEnabled").isBoolean().withMessage("notificationsEnabled must be boolean"),
  body("activityTrackingEnabled")
    .isBoolean()
    .withMessage("activityTrackingEnabled must be boolean"),
];

const getSettingsController = asyncHandler(async (req, res) => {
  res.json({ settings: await getSettings() });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();

  const updatedSettings = await updateSettingsRecord({
    id: settings.id,
    appName: req.body.appName.trim(),
    logoUrl: req.body.logoUrl?.trim() || "",
    defaultRole: req.body.defaultRole,
    notificationsEnabled: req.body.notificationsEnabled,
    activityTrackingEnabled: req.body.activityTrackingEnabled,
  });

  res.locals.activity = {
    action: ACTIVITY_ACTIONS.UPDATE,
    target: "settings",
    targetId: String(updatedSettings.id),
    targetName: updatedSettings.appName,
  };

  res.json({ message: "Settings updated successfully", settings: updatedSettings });
});

module.exports = {
  settingsValidators,
  getSettingsController,
  updateSettings,
};
