const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const activityLogger = require("../middleware/activityLogger");
const {
  taskValidators,
  idValidator,
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  bulkDeleteTasks,
} = require("../controllers/taskController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listTasks);
router.post("/", activityLogger(), taskValidators, validate, createTask);
router.post(
  "/bulk-delete",
  activityLogger(),
  body("ids").isArray({ min: 1 }).withMessage("At least one id is required"),
  validate,
  bulkDeleteTasks
);
router.get("/:id", idValidator, validate, getTaskById);
router.put("/:id", activityLogger(), idValidator, taskValidators, validate, updateTask);
router.put(
  "/:id/status",
  activityLogger(),
  idValidator,
  body("status").notEmpty().withMessage("Status is required"),
  validate,
  updateTaskStatus
);
router.delete("/:id", activityLogger(), idValidator, validate, deleteTask);

module.exports = router;
