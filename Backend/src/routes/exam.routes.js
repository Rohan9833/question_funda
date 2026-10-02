const express = require("express");
const {
  createExam,
  listTeacherExams,
  listAvailableExams,
  getExam,
  submitExam,
  listResults,
  getResultDetail,
  getExamPerformance,
  getExamAttemptDetail,
  updateExamStatus,
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
router.get("/:id/performance", requireAuth, getExamPerformance);
router.get("/:id/attempts/:attemptId", requireAuth, getExamAttemptDetail);
router.patch("/:id/status", requireAuth, updateExamStatus);
router.get("/:id", requireAuth, getExam);
router.post("/:id/submit", requireAuth, submitExam);

module.exports = router;
