const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getDashboard, getAnalytics } = require("../controllers/teacher.controller");

const router = express.Router();

router.get("/dashboard", requireAuth, getDashboard);
router.get("/analytics", requireAuth, getAnalytics);

module.exports = router;
