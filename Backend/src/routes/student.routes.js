const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getTeacherStudents } = require("../controllers/student.controller");

const router = express.Router();

router.get("/teacher", requireAuth, getTeacherStudents);

module.exports = router;
