const mongoose = require("mongoose");

const questionPaperSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    chapters: {
      type: [String],
      default: [],
    },
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    questions: { type: Number, default: 0, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    modes: {
      type: [String],
      default: ["Online", "Paper"],
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

questionPaperSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("QuestionPaper", questionPaperSchema);
