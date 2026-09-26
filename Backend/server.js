require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, () => {
  console.log(`
==========================================
  Question Funda Backend
==========================================
  Server running on: http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || "development"}
==========================================
  `);
});

// ==========================================
// HANDLE SERVER ERRORS
// ==========================================

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }

  console.error("Server error:", error);
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down server...`);

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));