const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

chapterSchema.index({ subjectId: 1, normalizedName: 1 }, { unique: true });

module.exports = mongoose.model("Chapter", chapterSchema);
