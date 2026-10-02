const Question = require("../models/Question");
const QuestionPaper = require("../models/QuestionPaper");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const StudentProfile = require("../models/StudentProfile");

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


const canViewPaper = (paper, req) =>
  req.auth?.role === "admin" || String(paper.createdBy) === String(req.auth?.sub);

const getQuestionPaper = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id).lean();
    if (!paper) return res.status(404).json({ success: false, message: "Question paper not found." });
    if (!canViewPaper(paper, req)) {
      return res.status(403).json({ success: false, message: "You cannot view this question paper." });
    }

    const questionIds = paper.questionIds || [];
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select("_id serialNumber text options correctAnswer difficulty")
      .lean();
    const map = new Map(questions.map((q) => [String(q._id), q]));
    const orderedQuestions = questionIds
      .map((id, index) => {
        const question = map.get(String(id));
        if (!question) return null;
        return { ...question, number: index + 1 };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      data: {
        paper: {
          id: paper._id,
          name: paper.name,
          subject: paper.subject,
          chapters: paper.chapters || [],
          questions: paper.questions || orderedQuestions.length,
          duration: paper.duration,
          status: paper.status,
          modes: paper.modes || [],
          createdBy: paper.createdBy,
          createdAt: paper.createdAt,
        },
        questions: orderedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const publishQuestionPaper = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: "Question paper not found." });
    if (!canViewPaper(paper, req)) return res.status(403).json({ success: false, message: "You cannot update this question paper." });

    const status = String(req.body.status || "Published");
    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid paper status." });
    }
    paper.status = status;
    await paper.save();
    return res.json({ success: true, message: "Question paper status updated.", data: paper });
  } catch (error) {
    next(error);
  }
};


const getQuestionPaperPerformance = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id).lean();
    if (!paper) return res.status(404).json({ success: false, message: "Question paper not found." });
    if (!canViewPaper(paper, req)) return res.status(403).json({ success: false, message: "You cannot view this question paper." });

    const exams = await Exam.find({ questionPaperId: paper._id })
      .select("_id name status createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const examIds = exams.map((exam) => exam._id);
    const attempts = examIds.length
      ? await ExamAttempt.find({ examId: { $in: examIds } })
          .populate("studentId", "name email profileImage")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const profiles = await StudentProfile.find({
      userId: { $in: attempts.map((a) => a.studentId?._id).filter(Boolean) },
    }).select("userId studentId standard board schoolName").lean();
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));
    const examMap = new Map(exams.map((exam) => [String(exam._id), exam]));

    const rows = attempts.map((attempt) => {
      const student = attempt.studentId;
      const profile = student ? profileMap.get(String(student._id)) : null;
      return {
        examId: attempt.examId,
        examName: examMap.get(String(attempt.examId))?.name || "Exam",
        examStatus: examMap.get(String(attempt.examId))?.status || "Closed",
        attemptId: attempt._id,
        student: student
          ? {
              id: student._id,
              name: student.name,
              email: student.email,
              profileImage: student.profileImage || "",
              studentId: profile?.studentId || "",
              standard: profile?.standard || "",
              board: profile?.board || "",
              schoolName: profile?.schoolName || "",
            }
          : null,
        score: Number(attempt.score) || 0,
        total: Number(attempt.total) || 0,
        percent: Number(attempt.percent) || 0,
        createdAt: attempt.createdAt,
      };
    });

    return res.json({
      success: true,
      data: {
        paper: {
          id: paper._id,
          name: paper.name,
          subject: paper.subject,
          questions: paper.questions || paper.questionIds?.length || 0,
          duration: paper.duration,
          status: paper.status,
        },
        exams: exams.map((exam) => ({
          id: exam._id,
          name: exam.name,
          status: exam.status,
          createdAt: exam.createdAt,
        })),
        attempts: rows,
        totals: {
          attempts: rows.length,
          students: new Set(rows.map((row) => String(row.student?.id)).filter(Boolean)).size,
          averagePercent: rows.length
            ? Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length)
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestionPaper,
  listQuestionPapers,
  getQuestionPaper,
  publishQuestionPaper,
  getQuestionPaperPerformance,
};
