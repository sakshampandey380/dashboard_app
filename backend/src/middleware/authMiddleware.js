const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { query } = require("../config/db");
const { mapUser } = require("../utils/mappers");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const token = authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [decoded.userId]);
  const user = users[0] ? mapUser(users[0]) : null;

  if (!user) {
    res.status(401);
    throw new Error("User no longer exists");
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;
