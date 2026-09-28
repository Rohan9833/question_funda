const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const StudentProfile = require("../models/StudentProfile");

const getTeacherStudents = async (req, res, next) => {
  try {
    if (req.auth.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can access the students list.",
      });
    }

    const search = String(req.query.search || "").trim().toLowerCase();
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 50, 1),
      100
    );

    const teacherExams = await Exam.find({
      createdBy: req.auth.sub,
    })
      .select("_id name")
      .lean();

    const examIds = teacherExams.map((exam) => exam._id);

    if (!examIds.length) {
      return res.status(200).json({
        success: true,
        data: {
          students: [],
          pagination: { page, limit, total: 0, pages: 0 },
          summary: {
            totalStudents: 0,
            totalAttempts: 0,
            averagePercent: 0,
            activeStudents: 0,
          },
        },
      });
    }

    const attempts = await ExamAttempt.find({
      examId: { $in: examIds },
    })
      .populate("studentId", "name email phone profileImage isActive role")
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = [
      ...new Set(
        attempts
          .map((attempt) => attempt.studentId?._id?.toString())
          .filter(Boolean)
      ),
    ];

    const profiles = await StudentProfile.find({
      userId: { $in: studentIds },
    })
      .select("userId studentId standard board schoolName academicYear")
      .lean();

    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile])
    );

    const examMap = new Map(
      teacherExams.map((exam) => [String(exam._id), exam.name])
    );

    const grouped = new Map();

    for (const attempt of attempts) {
      const user = attempt.studentId;

      if (!user || user.role !== "student") continue;

      const id = String(user._id);

      if (!grouped.has(id)) {
        const profile = profileMap.get(id);

        grouped.set(id, {
          id,
          studentId:
            profile?.studentId ||
            `STU-${id.slice(-6).toUpperCase()}`,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          profileImage: user.profileImage || "",
          standard: profile?.standard || "",
          board: profile?.board || "",
          schoolName: profile?.schoolName || "",
          academicYear: profile?.academicYear || "",
          isActive: user.isActive,
          examsCompleted: 0,
          attempts: 0,
          averagePercent: 0,
          totalScore: 0,
          totalMarks: 0,
          lastActiveAt: attempt.createdAt,
          examNames: new Set(),
        });
      }

      const student = grouped.get(id);

      student.attempts += 1;
      student.totalScore += Number(attempt.score) || 0;
      student.totalMarks += Number(attempt.total) || 0;
      student.examNames.add(
        examMap.get(String(attempt.examId)) || "Exam"
      );

      if (
        !student.lastActiveAt ||
        new Date(attempt.createdAt) > new Date(student.lastActiveAt)
      ) {
        student.lastActiveAt = attempt.createdAt;
      }
    }

    let students = Array.from(grouped.values()).map((student) => ({
      ...student,
      examsCompleted: student.examNames.size,
      averagePercent: student.attempts
        ? Math.round(
            Array.from(
              attempts
                .filter(
                  (attempt) =>
                    String(attempt.studentId?._id) === student.id
                )
                .map((attempt) => Number(attempt.percent) || 0)
            ).reduce((sum, percent) => sum + percent, 0) /
              student.attempts
          )
        : 0,
      averageScore: student.totalMarks
        ? Math.round((student.totalScore / student.totalMarks) * 100)
        : 0,
      examNames: Array.from(student.examNames),
    }));

    const totalStudents = students.length;
    const totalAttempts = students.reduce(
      (sum, student) => sum + student.attempts,
      0
    );
    const averagePercent = totalAttempts
      ? Math.round(
          students.reduce(
            (sum, student) => sum + student.averagePercent * student.attempts,
            0
          ) / totalAttempts
        )
      : 0;
    const activeStudents = students.filter((student) => student.isActive).length;

    if (search) {
      students = students.filter((student) => {
        const haystack = [
          student.name,
          student.email,
          student.studentId,
          student.phone,
          student.schoolName,
          student.standard,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    students.sort(
      (a, b) =>
        new Date(b.lastActiveAt).getTime() -
        new Date(a.lastActiveAt).getTime()
    );

    const total = students.length;
    const pages = total ? Math.ceil(total / limit) : 0;
    const start = (page - 1) * limit;

    students = students.slice(start, start + limit);

    return res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
        summary: {
          totalStudents,
          totalAttempts,
          averagePercent,
          activeStudents,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherStudents,
};
