const express = require("express");
const validate = require("../middleware/validate");
const activityLogger = require("../middleware/activityLogger");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerValidators,
  loginValidators,
  register,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", activityLogger(), registerValidators, validate, register);
router.post("/login", activityLogger(), loginValidators, validate, login);
router.post("/logout", authMiddleware, activityLogger(), logout);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
