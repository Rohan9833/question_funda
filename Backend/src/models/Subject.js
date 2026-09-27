const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
