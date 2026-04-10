const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { summary, charts } = require("../controllers/analyticsController");

const router = express.Router();

router.use(authMiddleware);
router.get("/summary", summary);
router.get("/charts", charts);

module.exports = router;
