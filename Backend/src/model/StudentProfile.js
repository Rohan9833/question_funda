const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, default: "", trim: true },
    standard: { type: String, default: "", trim: true },
    board: { type: String, default: "", trim: true },
    schoolName: { type: String, default: "", trim: true },
    academicYear: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
