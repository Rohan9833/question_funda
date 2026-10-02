const express = require("express");
const {
  createExam,
  listTeacherExams,
  listAvailableExams,
  getExam,
  submitExam,
  listResults,
  getResultDetail,
} = require("../controllers/exam.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, (req, res, next) => {
  if (req.auth.role === "student") {
    return listAvailableExams(req, res, next);
  }

  return listTeacherExams(req, res, next);
});

router.post("/", requireAuth, createExam);
router.get("/results/me", requireAuth, listResults);
router.get("/results/:id", requireAuth, getResultDetail);
router.get("/:id", requireAuth, getExam);
router.post("/:id/submit", requireAuth, submitExam);

module.exports = router;
