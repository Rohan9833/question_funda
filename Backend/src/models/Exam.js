const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    questionPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    questions: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 0 },
    modes: { type: [String], default: ["Online"] },
    students: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Draft", "Live", "Closed"],
      default: "Draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

examSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Exam", examSchema);
