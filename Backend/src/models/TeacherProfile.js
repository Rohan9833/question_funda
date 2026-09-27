const mongoose = require("mongoose");

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    teacherId: { type: String, required: true, unique: true, trim: true },
    qualification: { type: String, default: "", trim: true },
    specialization: { type: String, default: "", trim: true },
    experience: { type: Number, default: 0, min: 0 },
    institution: { type: String, default: "", trim: true },
    designation: { type: String, default: "", trim: true },
    subjects: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema);
