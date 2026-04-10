const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES, ACTIVITY_ACTIONS } = require("../constants");
const { getSettings } = require("../services/settingService");
const { notifyAdmins } = require("../services/notificationService");
const { query } = require("../config/db");
const { mapUser } = require("../utils/mappers");

const registerValidators = [
  body("name").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const loginValidators = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const register = asyncHandler(async (req, res) => {
  const { name, email, password, avatar = "" } = req.body;
  const existingUsers = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  const existingUser = existingUsers[0];

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email.");
  }

  const [{ totalUsers }] = await query("SELECT COUNT(*) AS totalUsers FROM users");
  const settings = await getSettings();
  const hashedPassword = await bcrypt.hash(password, 12);

  const insertResult = await query(
    "INSERT INTO users (name, email, password, role, status, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
    [
      name.trim(),
      email,
      hashedPassword,
      totalUsers === 0 ? ROLES.ADMIN : settings.defaultRole,
      "active",
      avatar.trim(),
    ]
  );
  const createdUsers = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [insertResult.insertId]);
  const user = mapUser(createdUsers[0]);

  if (totalUsers > 0) {
    await notifyAdmins({
      title: "New user registered",
      message: `${user.name} joined the workspace.`,
    });
  }

  res.locals.activityUser = user;
  res.locals.activity = {
    action: ACTIVITY_ACTIONS.CREATE,
    target: "user",
    targetId: String(user._id),
    targetName: user.name,
  };

  res.status(201).json({
    message: "Registration successful. Please log in.",
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const users = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  const user = users[0] ? mapUser(users[0]) : null;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (user.status !== "active") {
    res.status(403);
    throw new Error("Your account is inactive. Please contact an administrator.");
  }

  res.locals.activityUser = user;
  res.locals.activity = {
    action: ACTIVITY_ACTIONS.AUTH,
    target: "auth",
    targetId: String(user._id),
    targetName: `${user.name} logged in`,
  };

  res.json({
    token: generateToken(user),
    user: { ...user, password: undefined },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.locals.activity = {
    action: ACTIVITY_ACTIONS.AUTH,
    target: "auth",
    targetId: String(req.user._id),
    targetName: `${req.user.name} logged out`,
  };

  res.json({ message: "Logged out successfully" });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  registerValidators,
  loginValidators,
  register,
  login,
  logout,
  getCurrentUser,
};
