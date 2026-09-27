const Question = require("../models/Question");
const QuestionPaper = require("../models/QuestionPaper");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");

const text = (value) => String(value ?? "").trim();

const normalizeName = (value) =>
  text(value).toLowerCase().replace(/\s+/g, " ");

const getSubjectIdsForName = async (name) => {
  const subject = await Subject.findOne({
    normalizedName: normalizeName(name),
  })
    .select("_id")
    .lean();

  return subject ? [subject._id] : [];
};

const createQuestionPaper = async (req, res, next) => {
  try {
    const {
      name,
      subject,
      chapters = [],
      count,
      duration,
    } = req.body;

    const paperName = text(name);
    const paperSubject = text(subject);
    const requestedCount = Number(count);
    const paperDuration = Number(duration);

    if (!paperName) {
      return res.status(400).json({
        success: false,
        message: "Paper name is required.",
      });
    }

    if (!paperSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    if (!Number.isInteger(requestedCount) || requestedCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Questions count must be a positive integer.",
      });
    }

    if (!Number.isInteger(paperDuration) || paperDuration < 1) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive integer.",
      });
    }

    if (!Array.isArray(chapters)) {
      return res.status(400).json({
        success: false,
        message: "Chapters must be an array.",
      });
    }

    const chapterNames = chapters.map(text).filter(Boolean);
    const filter = {};

    if (paperSubject !== "Mixed") {
      const subjectIds = await getSubjectIdsForName(paperSubject);

      if (!subjectIds.length) {
        return res.status(400).json({
          success: false,
          message: "No questions found for the selected subject.",
        });
      }

      filter.subjectId = { $in: subjectIds };

      if (chapterNames.length) {
        const chaptersFromDb = await Chapter.find({
          subjectId: { $in: subjectIds },
          normalizedName: { $in: chapterNames.map(normalizeName) },
        })
          .select("_id")
          .lean();

        filter.chapterId = {
          $in: chaptersFromDb.map((chapter) => chapter._id),
        };

        if (!filter.chapterId.$in.length) {
          return res.status(400).json({
            success: false,
            message: "No questions found for the selected chapters.",
          });
        }
      }
    }

    const selectedQuestions = await Question.find(filter)
      .select("_id")
      .sort({ serialNumber: 1, createdAt: 1 })
      .limit(requestedCount)
      .lean();

    if (!selectedQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "No questions are available for the selected criteria.",
      });
    }

    const paper = await QuestionPaper.create({
      name: paperName,
      subject: paperSubject,
      chapters: paperSubject === "Mixed" ? [] : chapterNames,
      questionIds: selectedQuestions.map((question) => question._id),
      questions: selectedQuestions.length,
      duration: paperDuration,
      status: "Draft",
      modes: ["Online", "Paper"],
      createdBy: req.auth.sub,
    });

    return res.status(201).json({
      success: true,
      message: "Question paper generated successfully.",
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

const listQuestionPapers = async (req, res, next) => {
  try {
    const papers = await QuestionPaper.find({
      createdBy: req.auth.sub,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: papers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestionPaper,
  listQuestionPapers,
};
