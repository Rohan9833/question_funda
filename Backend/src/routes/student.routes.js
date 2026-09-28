const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getTeacherStudents, getStudentDashboard } = require("../controllers/student.controller");

const router = express.Router();

router.get("/teacher", requireAuth, getTeacherStudents);
router.get("/dashboard", requireAuth, getStudentDashboard);

module.exports = router;
