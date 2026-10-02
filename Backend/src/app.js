const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const { hashPassword } = require("./utils/auth");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Question Funda API is running",
  });
});

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/auth.routes");
const questionRoutes = require("./routes/question.routes");
const questionPaperRoutes = require("./routes/questionPaper.routes");
const examRoutes = require("./routes/exam.routes");
const studentRoutes = require("./routes/student.routes");
const principalRoutes = require("./routes/principal.routes");

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/question-papers", questionPaperRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/principal", principalRoutes);

// ==========================================
// CREATE PRINCIPAL
// POST /api/principal/create
//
// Bootstrap endpoint for creating a Principal.
// Use only for initial/local setup and protect it
// before exposing it in production.
// ==========================================

app.post("/api/principal/create", async (req, res, next) => {
  try {
    const {
      principalId,
      name,
      email,
      password,
    } = req.body;

    if (!principalId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "principalId, name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPrincipalId = principalId.trim().toUpperCase();

    const [existingEmail, existingPrincipal] = await Promise.all([
      User.findOne({ email: normalizedEmail }).lean(),
      User.findOne({ principalId: normalizedPrincipalId }).lean(),
    ]);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    if (existingPrincipal) {
      return res.status(409).json({
        success: false,
        message: "This Principal ID already exists",
      });
    }

    const principal = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: "admin",
      principalId: normalizedPrincipalId,
      isActive: true,
      isEmailVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "Principal created successfully",
      principal: {
        id: principal._id,
        principalId: principal.principalId,
        name: principal.name,
        email: principal.email,
        role: principal.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
