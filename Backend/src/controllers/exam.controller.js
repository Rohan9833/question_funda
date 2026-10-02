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

const getResultDetail = async (req, res, next) => {
  try {
    const attempt = await ExamAttempt.findOne({
      _id: req.params.id,
      studentId: req.auth.sub,
    })
      .populate("examId", "name questionPaperId")
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Result not found.",
      });
    }

    const paper = await QuestionPaper.findById(attempt.examId?.questionPaperId)
      .select("questionIds")
      .lean();

    const questionIds = paper?.questionIds || [];
    const questions = await Question.find({
      _id: { $in: questionIds },
    })
      .select("_id text options correctAnswer")
      .lean();

    const questionMap = new Map(
      questions.map((question) => [String(question._id), question])
    );

    const answerMap = new Map(
      (attempt.answers || []).map((answer) => [
        String(answer.questionId),
        answer.answer,
      ])
    );

    const correctIndex = { A: 0, B: 1, C: 2, D: 3 };

    const questionResults = questionIds
      .map((questionId, index) => {
        const question = questionMap.get(String(questionId));

        if (!question) return null;

        const selectedAnswer = answerMap.has(String(questionId))
          ? answerMap.get(String(questionId))
          : null;

        const correctAnswer = correctIndex[question.correctAnswer];
        const status =
          selectedAnswer === null || selectedAnswer === undefined
            ? "missed"
            : selectedAnswer === correctAnswer
              ? "correct"
              : "wrong";

        return {
          questionId: question._id,
          number: index + 1,
          text: question.text,
          options: (question.options || []).map((option) => option.text),
          selectedAnswer,
          correctAnswer,
          status,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: {
        id: attempt._id,
        name: attempt.examId?.name || "Exam",
        score: attempt.score,
        total: attempt.total,
        percent: attempt.percent,
        createdAt: attempt.createdAt,
        questions: questionResults,
      },
    });
  } catch (error) {
    next(error);
  }
};


const canViewExam = (exam, req) =>
  req.auth?.role === "admin" || String(exam.createdBy) === String(req.auth?.sub);

const getAttemptQuestionResults = async (attempt, questionIds) => {
  const questions = await Question.find({ _id: { $in: questionIds } })
    .select("_id text options correctAnswer")
    .lean();
  const questionMap = new Map(
    questions.map((question) => [String(question._id), question])
  );
  const answerMap = new Map(
    (attempt.answers || []).map((answer) => [
      String(answer.questionId),
      answer.answer,
    ])
  );
  const correctIndex = { A: 0, B: 1, C: 2, D: 3 };

  return questionIds.map((questionId, index) => {
    const question = questionMap.get(String(questionId));
    if (!question) return null;

    const selectedAnswer = answerMap.has(String(questionId))
      ? answerMap.get(String(questionId))
      : null;
    const correctAnswer = correctIndex[question.correctAnswer];
    const status =
      selectedAnswer === null || selectedAnswer === undefined
        ? "missed"
        : selectedAnswer === correctAnswer
          ? "correct"
          : "wrong";

    return {
      questionId: question._id,
      number: index + 1,
      text: question.text,
      options: question.options || [],
      selectedAnswer,
      correctAnswer,
      status,
    };
  }).filter(Boolean);
};

const getExamPerformance = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found." });
    }
    if (!canViewExam(exam, req)) {
      return res.status(403).json({ success: false, message: "You cannot view this exam." });
    }

    const paper = await QuestionPaper.findById(exam.questionPaperId)
      .select("questionIds name subject duration")
      .lean();
    const questionIds = paper?.questionIds || [];

    const attempts = await ExamAttempt.find({ examId: exam._id })
      .populate("studentId", "name email profileImage")
      .sort({ createdAt: -1 })
      .lean();

    const profiles = await require("../models/StudentProfile").find({
      userId: { $in: attempts.map((a) => a.studentId?._id).filter(Boolean) },
    }).select("userId studentId standard board schoolName").lean();
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const rows = [];
    for (const attempt of attempts) {
      const results = await getAttemptQuestionResults(attempt, questionIds);
      const counts = results.reduce(
        (acc, item) => {
          acc[item.status] += 1;
          if (item.status !== "missed") acc.attempted += 1;
          return acc;
        },
        { correct: 0, wrong: 0, missed: 0, attempted: 0 }
      );
      const student = attempt.studentId;
      const profile = student ? profileMap.get(String(student._id)) : null;

      rows.push({
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
        ...counts,
      });
    }

    const totals = rows.reduce(
      (acc, row) => {
        acc.attempts += 1;
        acc.correct += row.correct;
        acc.wrong += row.wrong;
        acc.missed += row.missed;
        acc.attempted += row.attempted;
        acc.score += row.score;
        acc.total += row.total;
        return acc;
      },
      { attempts: 0, correct: 0, wrong: 0, missed: 0, attempted: 0, score: 0, total: 0 }
    );

    return res.json({
      success: true,
      data: {
        exam: {
          id: exam._id,
          name: exam.name,
          status: exam.status,
          questions: exam.questions,
          duration: exam.duration,
          marks: exam.marks,
          modes: exam.modes || [],
          questionPaperId: exam.questionPaperId,
        },
        paper,
        attempts: rows,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getExamAttemptDetail = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found." });
    if (!canViewExam(exam, req)) return res.status(403).json({ success: false, message: "You cannot view this exam." });

    const attempt = await ExamAttempt.findOne({
      _id: req.params.attemptId,
      examId: exam._id,
    }).populate("studentId", "name email profileImage").lean();

    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found." });

    const paper = await QuestionPaper.findById(exam.questionPaperId).select("questionIds").lean();
    const questions = await getAttemptQuestionResults(attempt, paper?.questionIds || []);
    const profile = attempt.studentId
      ? await require("../models/StudentProfile").findOne({ userId: attempt.studentId._id }).lean()
      : null;

    const counts = questions.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        if (item.status !== "missed") acc.attempted += 1;
        return acc;
      },
      { correct: 0, wrong: 0, missed: 0, attempted: 0 }
    );

    return res.json({
      success: true,
      data: {
        attempt: {
          id: attempt._id,
          score: Number(attempt.score) || 0,
          total: Number(attempt.total) || 0,
          percent: Number(attempt.percent) || 0,
          createdAt: attempt.createdAt,
        },
        student: attempt.studentId
          ? {
              id: attempt.studentId._id,
              name: attempt.studentId.name,
              email: attempt.studentId.email,
              profileImage: attempt.studentId.profileImage || "",
              studentId: profile?.studentId || "",
              standard: profile?.standard || "",
              board: profile?.board || "",
              schoolName: profile?.schoolName || "",
            }
          : null,
        counts,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateExamStatus = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found." });
    if (!canViewExam(exam, req)) return res.status(403).json({ success: false, message: "You cannot update this exam." });

    const status = String(req.body.status || "").trim();
    if (!["Draft", "Live", "Closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid exam status." });
    }

    exam.status = status;
    await exam.save();
    return res.json({ success: true, message: "Exam status updated.", data: exam });
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
  getResultDetail,
  getExamPerformance,
  getExamAttemptDetail,
  updateExamStatus,
};
