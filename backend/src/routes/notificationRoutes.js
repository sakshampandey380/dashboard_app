const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  idValidator,
  bulkValidators,
  listNotifications,
  markNotificationRead,
  markAllRead,
  markManyRead,
  deleteNotification,
  bulkDeleteNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listNotifications);
router.put("/mark-all-read", markAllRead);
router.put("/read-many", bulkValidators, validate, markManyRead);
router.put("/:id/read", idValidator, validate, markNotificationRead);
router.delete("/:id", idValidator, validate, deleteNotification);
router.post("/bulk-delete", bulkValidators, validate, bulkDeleteNotifications);

module.exports = router;
