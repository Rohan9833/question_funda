const express = require("express");
const cors = require("cors");

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

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/question-papers", questionPaperRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/students", studentRoutes);

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
