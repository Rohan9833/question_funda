const mongoose = require("mongoose");

const questionImportSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: ["update"],
      default: "update",
    },
    status: {
      type: String,
      enum: ["validated", "completed", "failed"],
      default: "validated",
    },
    mapping: {
      type: Map,
      of: String,
      default: {},
    },
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    importedRows: { type: Number, default: 0 },
    updatedRows: { type: Number, default: 0 },
    skippedRows: { type: Number, default: 0 },
    failedRows: { type: Number, default: 0 },
    errors: [
      {
        row: Number,
        message: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuestionImport", questionImportSchema);
