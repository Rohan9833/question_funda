const express = require("express");
const {
  createQuestionPaper,
  listQuestionPapers,
  getQuestionPaper,
  publishQuestionPaper,
  getQuestionPaperPerformance,
} = require("../controllers/questionPaper.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listQuestionPapers);
router.post("/", requireAuth, createQuestionPaper);
router.get("/:id/performance", requireAuth, getQuestionPaperPerformance);
router.get("/:id", requireAuth, getQuestionPaper);
router.patch("/:id/status", requireAuth, publishQuestionPaper);

module.exports = router;
