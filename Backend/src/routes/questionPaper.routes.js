const express = require("express");
const {
  createQuestionPaper,
  listQuestionPapers,
} = require("../controllers/questionPaper.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listQuestionPapers);
router.post("/", requireAuth, createQuestionPaper);

module.exports = router;
