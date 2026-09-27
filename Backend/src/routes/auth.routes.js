const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
  updateProfile,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.post("/logout-all", requireAuth, logoutAll);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);

module.exports = router;
