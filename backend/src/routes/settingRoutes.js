const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const activityLogger = require("../middleware/activityLogger");
const { ROLES } = require("../constants");
const {
  settingsValidators,
  getSettingsController,
  updateSettings,
} = require("../controllers/settingController");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(ROLES.ADMIN));
router.get("/", getSettingsController);
router.put("/", activityLogger(), settingsValidators, validate, updateSettings);

module.exports = router;
