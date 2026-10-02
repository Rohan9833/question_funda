const User = require("../models/User");
const Question = require("../models/Question");
const QuestionPaper = require("../models/QuestionPaper");
const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");

const requireTeacher = (req, res) => {
  if (req.auth?.role !== "teacher") {
    res.status(403).json({ success: false, message: "Teacher access is required." });
    return false;
  }
  return true;
};

const getDashboard = async (req, res, next) => {
  if (!requireTeacher(req, res)) return;
  try {
    const teacherId = req.auth.sub;
    const [questionCount, papers, exams, attempts] = await Promise.all([
      Question.countDocuments({ createdBy: teacherId }),
      QuestionPaper.find({ createdBy: teacherId }).sort({ createdAt: -1 }).limit(5).lean(),
      Exam.find({ createdBy: teacherId }).sort({ createdAt: -1 }).lean(),
      ExamAttempt.find({
        examId: {
          $in: (await Exam.find({ createdBy: teacherId }).select("_id").lean()).map((e) => e._id),
        },
      }).select("score total percent studentId examId createdAt").lean(),
    ]);

    const activeExams = exams.filter((exam) => exam.status === "Live");
    const uniqueStudents = new Set(attempts.map((attempt) => String(attempt.studentId)).filter(Boolean));
    const averagePercent = attempts.length
      ? Math.round(attempts.reduce((sum, attempt) => sum + (Number(attempt.percent) || 0), 0) / attempts.length)
      : 0;

    const subjectCounts = await Question.aggregate([
      { $match: { createdBy: teacherId } },
      { $lookup: { from: "subjects", localField: "subjectId", foreignField: "_id", as: "subject" } },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$subject.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const attemptMap = new Map();
    for (const attempt of attempts) {
      const key = String(attempt.examId);
      attemptMap.set(key, (attemptMap.get(key) || 0) + 1);
    }

    return res.json({
      success: true,
      data: {
        stats: {
          questions: questionCount,
          papers: papers.length,
          totalPapers: await QuestionPaper.countDocuments({ createdBy: teacherId }),
          drafts: await QuestionPaper.countDocuments({ createdBy: teacherId, status: "Draft" }),
          activeExams: activeExams.length,
          students: uniqueStudents.size,
          attempts: attempts.length,
          averagePercent,
        },
        recentPapers: papers.map((paper) => ({
          id: paper._id,
          name: paper.name,
          questions: paper.questions || paper.questionIds?.length || 0,
          duration: paper.duration,
          status: paper.status,
          subject: paper.subject,
          createdAt: paper.createdAt,
        })),
        questionBank: subjectCounts.map((item) => ({
          subject: item._id || "General",
          count: item.count,
        })),
        exams: exams.slice(0, 8).map((exam) => ({
          id: exam._id,
          name: exam.name,
          questions: exam.questions,
          students: attemptMap.get(String(exam._id)) || 0,
          status: exam.status,
          duration: exam.duration,
          createdAt: exam.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  if (!requireTeacher(req, res)) return;
  try {
    const teacherId = req.auth.sub;
    const exams = await Exam.find({ createdBy: teacherId }).select("_id").lean();
    const examIds = exams.map((exam) => exam._id);
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const attempts = examIds.length
      ? await ExamAttempt.find({ examId: { $in: examIds }, createdAt: { $gte: since } })
          .select("createdAt percent score total answers")
          .lean()
      : [];

    const allAttempts = examIds.length
      ? await ExamAttempt.find({ examId: { $in: examIds } })
          .select("percent score total answers")
          .lean()
      : [];

    const daily = new Map();
    for (let i = 0; i < 30; i++) {
      const date = new Date(since);
      date.setDate(since.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      daily.set(key, {
        date: key,
        label: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        attempts: 0,
        percentTotal: 0,
      });
    }

    for (const attempt of attempts) {
      const key = new Date(attempt.createdAt).toISOString().slice(0, 10);
      const day = daily.get(key);
      if (!day) continue;
      day.attempts += 1;
      day.percentTotal += Number(attempt.percent) || 0;
    }

    const activity = Array.from(daily.values()).map((day) => ({
      ...day,
      averagePercent: day.attempts ? Math.round(day.percentTotal / day.attempts) : 0,
    }));

    const totalAnswered = allAttempts.reduce(
      (sum, attempt) =>
        sum +
        (attempt.answers || []).filter(
          (answer) => answer.answer !== null && answer.answer !== undefined
        ).length,
      0
    );
    const correctAnswers = allAttempts.reduce(
      (sum, attempt) => sum + ((Number(attempt.score) || 0) / 4),
      0
    );

    return res.json({
      success: true,
      data: {
        totals: {
          attempts: allAttempts.length,
          averagePercent: allAttempts.length
            ? Math.round(allAttempts.reduce((sum, a) => sum + (Number(a.percent) || 0), 0) / allAttempts.length)
            : 0,
          students: new Set(
            (await ExamAttempt.find({ examId: { $in: examIds } }).select("studentId").lean())
              .map((a) => String(a.studentId))
          ).size,
          questionsAnswered: totalAnswered,
          accuracy: totalAnswered ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
        },
        activity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getAnalytics };
