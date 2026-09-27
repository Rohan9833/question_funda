const Exam = require("../models/Exam");
const QuestionPaper = require("../models/QuestionPaper");
const Question = require("../models/Question");
const ExamAttempt = require("../models/ExamAttempt");

const text = (value) => String(value ?? "").trim();

const createExam = async (req, res, next) => {
  try {
    const { questionPaperId, modes = ["Online"], status = "Draft" } = req.body;

    const paper = await QuestionPaper.findOne({
      _id: questionPaperId,
      createdBy: req.auth.sub,
    }).lean();

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found.",
      });
    }

    const validModes = Array.isArray(modes)
      ? modes.filter((mode) => ["Online", "Paper"].includes(mode))
      : [];

    if (!validModes.length) {
      return res.status(400).json({
        success: false,
        message: "At least one valid exam mode is required.",
      });
    }

    const exam = await Exam.create({
      questionPaperId: paper._id,
      name: paper.name,
      questions: paper.questionIds.length,
      duration: paper.duration,
      marks: paper.questionIds.length * 4,
      modes: validModes,
      status: ["Draft", "Live"].includes(status) ? status : "Draft",
      createdBy: req.auth.sub,
    });

    return res.status(201).json({
      success: true,
      message: "Exam created successfully.",
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

const listTeacherExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ createdBy: req.auth.sub })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

const listAvailableExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ status: "Live" })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    if (req.auth.role === "student" && exam.status !== "Live") {
      return res.status(403).json({
        success: false,
        message: "This exam is not currently available.",
      });
    }

    const paper = await QuestionPaper.findById(exam.questionPaperId)
      .select("questionIds")
      .lean();

    const questionIds = paper?.questionIds || [];

    const questions = await Question.find({
      _id: { $in: questionIds },
    })
      .select("_id text options")
      .lean();

    const questionMap = new Map(
      questions.map((question) => [String(question._id), question])
    );

    const orderedQuestions = questionIds
      .map((id) => questionMap.get(String(id)))
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: {
        exam,
        questions: orderedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const submitExam = async (req, res, next) => {
  try {
    if (req.auth.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit an exam.",
      });
    }

    const exam = await Exam.findOne({
      _id: req.params.id,
      status: "Live",
    }).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Live exam not found.",
      });
    }

    const paper = await QuestionPaper.findById(exam.questionPaperId)
      .select("questionIds")
      .lean();

    const questionIds = paper?.questionIds || [];
    const submittedAnswers = Array.isArray(req.body.answers)
      ? req.body.answers
      : [];

    const answerMap = new Map(
      submittedAnswers.map((item) => [
        String(item.questionId),
        Number.isInteger(Number(item.answer)) ? Number(item.answer) : null,
      ])
    );

    const questions = await Question.find({
      _id: { $in: questionIds },
    })
      .select("_id correctAnswer")
      .lean();

    const correctIndex = { A: 0, B: 1, C: 2, D: 3 };
    let score = 0;

    const answers = questionIds.map((questionId) => {
      const question = questions.find(
        (item) => String(item._id) === String(questionId)
      );
      const answer = answerMap.has(String(questionId))
        ? answerMap.get(String(questionId))
        : null;

      if (question && answer === correctIndex[question.correctAnswer]) {
        score += 4;
      }

      return { questionId, answer };
    });

    const total = questionIds.length * 4;
    const percent = total ? Math.round((score / total) * 100) : 0;

    const attempt = await ExamAttempt.create({
      examId: exam._id,
      studentId: req.auth.sub,
      answers,
      score,
      total,
      percent,
    });

    await Exam.updateOne(
      { _id: exam._id },
      { $inc: { students: 1 } }
    );

    return res.status(201).json({
      success: true,
      message: "Exam submitted successfully.",
      data: {
        id: attempt._id,
        name: exam.name,
        score,
        total,
        percent,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listResults = async (req, res, next) => {
  try {
    const attempts = await ExamAttempt.find({
      studentId: req.auth.sub,
    })
      .populate("examId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: attempts.map((attempt) => ({
        id: attempt._id,
        name: attempt.examId?.name || "Exam",
        score: attempt.score,
        total: attempt.total,
        percent: attempt.percent,
        createdAt: attempt.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  listTeacherExams,
  listAvailableExams,
  getExam,
  submitExam,
  listResults,
};
