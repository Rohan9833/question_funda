const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["A", "B", "C", "D"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number, default: null },
    text: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      validate: {
        validator: (value) => value.length === 4 && value.every((x) => x.text.trim()),
        message: "Exactly four non-empty options are required",
      },
    },
    correctAnswer: { type: String, enum: ["A", "B", "C", "D"], required: true },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    sourceImportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionImport",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

questionSchema.index({ subjectId: 1, chapterId: 1, text: 1 });

module.exports = mongoose.model("Question", questionSchema);
