const express = require("express");
const {
  validateImport,
  confirmImport,
  listQuestions,
  listImportHistory,
} = require("../controllers/question.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listQuestions);
router.get("/imports/history", requireAuth, listImportHistory);
router.post("/import/validate", requireAuth, validateImport);
router.post("/import/confirm", requireAuth, confirmImport);

module.exports = router;
