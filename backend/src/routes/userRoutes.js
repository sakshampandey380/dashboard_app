const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const activityLogger = require("../middleware/activityLogger");
const { ROLES } = require("../constants");
const {
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
} = require("../controllers/userController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", roleMiddleware(ROLES.ADMIN), listUsers);
router.post("/", roleMiddleware(ROLES.ADMIN), activityLogger(), userValidators, validate, createUser);
router.post(
  "/bulk-delete",
  roleMiddleware(ROLES.ADMIN),
  activityLogger(),
  body("ids").isArray({ min: 1 }).withMessage("At least one id is required"),
  validate,
  bulkDeleteUsers
);
router.put("/profile/me", activityLogger(), userValidators, validate, updateProfile);
router.put("/profile/change-password", activityLogger(), changePassword);
router.get("/:id", idValidator, validate, getUserById);
router.put("/:id", roleMiddleware(ROLES.ADMIN), activityLogger(), idValidator, userValidators, validate, updateUser);
router.patch("/:id/status", roleMiddleware(ROLES.ADMIN), activityLogger(), idValidator, validate, toggleUserStatus);
router.delete("/:id", roleMiddleware(ROLES.ADMIN), activityLogger(), idValidator, validate, deleteUser);

module.exports = router;
