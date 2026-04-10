const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listActivities } = require("../controllers/activityController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listActivities);

module.exports = router;
