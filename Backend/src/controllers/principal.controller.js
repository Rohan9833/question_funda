const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const StudentProfile = require("../models/StudentProfile");
const Question = require("../models/Question");
const QuestionPaper = require("../models/QuestionPaper");
const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");

const requirePrincipal = (req, res) => {
  if (req.auth?.role !== "admin") { res.status(403).json({ success: false, message: "Principal access is required." }); return false; }
  return true;
};
const text = (value) => String(value ?? "").trim();
const pageArgs = (req) => ({ page: Math.max(Number.parseInt(req.query.page, 10) || 1, 1), limit: Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100) });

const getOverview = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    const [teachers, students, questions, papers, exams, attempts, recentExams] = await Promise.all([
      User.countDocuments({ role: "teacher" }), User.countDocuments({ role: "student" }), Question.countDocuments(), QuestionPaper.countDocuments(), Exam.countDocuments(), ExamAttempt.countDocuments(),
      Exam.find({}).populate("createdBy", "name email").sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    const [activeTeachers, activeStudents, publishedPapers, liveExams, average, recentAttemptCounts] = await Promise.all([
      User.countDocuments({ role: "teacher", isActive: true }), User.countDocuments({ role: "student", isActive: true }), QuestionPaper.countDocuments({ status: "Published" }), Exam.countDocuments({ status: "Live" }),
      ExamAttempt.aggregate([{ $group: { _id: null, averagePercent: { $avg: "$percent" } } }]),
      ExamAttempt.aggregate([{ $group: { _id: "$examId", count: { $sum: 1 } } }]),
    ]);
    const attemptMap = new Map(recentAttemptCounts.map((item) => [String(item._id), item.count]));
    return res.json({ success: true, data: { counts: { teachers, students, questions, papers, exams, attempts }, active: { teachers: activeTeachers, students: activeStudents }, publishedPapers, liveExams, averagePercent: Math.round(average[0]?.averagePercent || 0), recentExams: recentExams.map((exam) => ({ id: exam._id, name: exam.name, teacher: exam.createdBy?.name || "Unknown", questions: exam.questions, attempts: attemptMap.get(String(exam._id)) || 0, status: exam.status, date: exam.createdAt })) } });
  } catch (error) { next(error); }
};

const listTeachers = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    const { page, limit } = pageArgs(req); const search = text(req.query.search); const filter = { role: "teacher" };
    if (search) { const matchingProfiles = await TeacherProfile.find({ teacherId: { $regex: search, $options: "i" } }).select("userId").lean(); filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { _id: { $in: matchingProfiles.map((p) => p.userId) } }]; }
    const [users, total, activeTotal] = await Promise.all([User.find(filter).select("name email phone profileImage isActive createdAt lastLoginAt").sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(filter), User.countDocuments({ ...filter, isActive: true })]);
    const ids = users.map((u) => u._id);
    const [profiles, papers, exams] = await Promise.all([
      TeacherProfile.find({ userId: { $in: ids } }).lean(),
      QuestionPaper.aggregate([{ $match: { createdBy: { $in: ids } } }, { $group: { _id: "$createdBy", count: { $sum: 1 } } }]),
      Exam.aggregate([{ $match: { createdBy: { $in: ids } } }, { $group: { _id: "$createdBy", count: { $sum: 1 } } }]),
    ]);
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p])); const paperMap = new Map(papers.map((p) => [String(p._id), p.count])); const examMap = new Map(exams.map((e) => [String(e._id), e.count]));
    const data = users.map((user) => { const profile = profileMap.get(String(user._id)); return { id: user._id, teacherId: profile?.teacherId || ("T-" + String(user._id).slice(-6).toUpperCase()), name: user.name, email: user.email, phone: user.phone || "", subjects: profile?.subjects || [], subject: profile?.subjects?.join(", ") || profile?.specialization || "—", qualification: profile?.qualification || "", institution: profile?.institution || "", designation: profile?.designation || "", papers: paperMap.get(String(user._id)) || 0, exams: examMap.get(String(user._id)) || 0, status: user.isActive ? "Active" : "Inactive", isActive: user.isActive, lastLoginAt: user.lastLoginAt }; });
    return res.json({ success: true, data: { teachers: data, pagination: { page, limit, total, pages: total ? Math.ceil(total / limit) : 0 }, summary: { totalTeachers: total, activeTeachers: activeTotal } } });
  } catch (error) { next(error); }
};

const listStudents = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    const { page, limit } = pageArgs(req); const search = text(req.query.search); const filter = { role: "student" };
    if (search) { const matchingProfiles = await StudentProfile.find({ studentId: { $regex: search, $options: "i" } }).select("userId").lean(); filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { _id: { $in: matchingProfiles.map((p) => p.userId) } }]; }
    const [users, total, activeTotal] = await Promise.all([User.find(filter).select("name email phone profileImage isActive createdAt lastLoginAt").sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(filter), User.countDocuments({ ...filter, isActive: true })]);
    const ids = users.map((u) => u._id);
    const [profiles, attempts] = await Promise.all([StudentProfile.find({ userId: { $in: ids } }).lean(), ExamAttempt.find({ studentId: { $in: ids } }).select("studentId examId percent createdAt").lean()]);
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p])); const grouped = new Map();
    for (const attempt of attempts) { const key = String(attempt.studentId); if (!grouped.has(key)) grouped.set(key, { attempts: 0, totalPercent: 0, exams: new Set(), lastActiveAt: null }); const s = grouped.get(key); s.attempts += 1; s.totalPercent += Number(attempt.percent) || 0; s.exams.add(String(attempt.examId)); if (!s.lastActiveAt || new Date(attempt.createdAt) > new Date(s.lastActiveAt)) s.lastActiveAt = attempt.createdAt; }
    const data = users.map((user) => { const profile = profileMap.get(String(user._id)); const s = grouped.get(String(user._id)) || { attempts: 0, totalPercent: 0, exams: new Set(), lastActiveAt: null }; const avg = s.attempts ? Math.round(s.totalPercent / s.attempts) : 0; return { id: user._id, studentId: profile?.studentId || ("S-" + String(user._id).slice(-6).toUpperCase()), name: user.name, email: user.email, phone: user.phone || "", className: profile?.standard || "—", standard: profile?.standard || "", board: profile?.board || "", schoolName: profile?.schoolName || "", academicYear: profile?.academicYear || "", exams: s.exams.size, attempts: s.attempts, average: avg, averagePercent: avg, lastActiveAt: s.lastActiveAt || user.lastLoginAt, status: user.isActive ? "Active" : "Inactive", isActive: user.isActive }; });
    return res.json({ success: true, data: { students: data, pagination: { page, limit, total, pages: total ? Math.ceil(total / limit) : 0 }, summary: { totalStudents: total, activeStudents: activeTotal, totalAttempts: attempts.length, averagePercent: attempts.length ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.percent) || 0), 0) / attempts.length) : 0 } } });
  } catch (error) { next(error); }
};

const listExams = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    const { page, limit } = pageArgs(req); const search = text(req.query.search); const status = text(req.query.status); const filter = {};
    if (status && ["Draft", "Live", "Closed"].includes(status)) filter.status = status; if (search) filter.name = { $regex: search, $options: "i" };
    const [exams, total] = await Promise.all([Exam.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Exam.countDocuments(filter)]);
    const counts = await ExamAttempt.aggregate([{ $match: { examId: { $in: exams.map((e) => e._id) } } }, { $group: { _id: "$examId", count: { $sum: 1 } } }]); const countMap = new Map(counts.map((x) => [String(x._id), x.count]));
    return res.json({ success: true, data: { exams: exams.map((e) => ({ id: e._id, name: e.name, teacher: e.createdBy?.name || "Unknown", teacherId: e.createdBy?._id || null, questions: e.questions, attempts: countMap.get(String(e._id)) || 0, date: e.createdAt, status: e.status, duration: e.duration, marks: e.marks, modes: e.modes || [] })), pagination: { page, limit, total, pages: total ? Math.ceil(total / limit) : 0 } } });
  } catch (error) { next(error); }
};

const listPapers = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    const { page, limit } = pageArgs(req); const search = text(req.query.search); const filter = search ? { name: { $regex: search, $options: "i" } } : {};
    const [papers, total] = await Promise.all([QuestionPaper.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), QuestionPaper.countDocuments(filter)]);
    return res.json({ success: true, data: { papers: papers.map((p) => ({ id: p._id, name: p.name, teacher: p.createdBy?.name || "Unknown", teacherId: p.createdBy?._id || null, questions: p.questions || p.questionIds?.length || 0, duration: p.duration, subject: p.subject, chapters: p.chapters || [], status: p.status, modes: p.modes || [], createdAt: p.createdAt })), pagination: { page, limit, total, pages: total ? Math.ceil(total / limit) : 0 } } });
  } catch (error) { next(error); }
};

const listQuestions = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    const { page, limit } = pageArgs(req); const search = text(req.query.search); const subject = text(req.query.subject); const difficulty = text(req.query.difficulty); const filter = {};
    if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) filter.difficulty = difficulty;
    const questions = await Question.find(filter).populate("subjectId", "name").populate("chapterId", "name").populate("createdBy", "name email").sort({ createdAt: -1 }).lean();
    let filtered = questions;
    if (search) filtered = filtered.filter((q) => [q.text, q.subjectId?.name, q.chapterId?.name, q.difficulty, q.createdBy?.name].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));
    if (subject) filtered = filtered.filter((q) => q.subjectId?.name === subject);
    const total = filtered.length; const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit).map((q) => ({ id: q._id, text: q.text, options: q.options || [], subject: q.subjectId?.name || "General", chapter: q.chapterId?.name || "General", difficulty: q.difficulty || "Medium", createdBy: q.createdBy?.name || "Unknown", createdById: q.createdBy?._id || null, createdAt: q.createdAt }));
    const subjects = [...new Set(questions.map((q) => q.subjectId?.name).filter(Boolean))].sort();
    return res.json({ success: true, data: { questions: data, subjects, pagination: { page, limit, total, pages: total ? Math.ceil(total / limit) : 0 } } });
  } catch (error) { next(error); }
};

const getAnalytics = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
    const [attempts, average, statusCounts] = await Promise.all([ExamAttempt.find({ createdAt: { $gte: since } }).select("createdAt percent").lean(), ExamAttempt.aggregate([{ $group: { _id: null, averagePercent: { $avg: "$percent" }, attempts: { $sum: 1 } } }]), Exam.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])]);
    const dayMap = new Map(); for (let i = 0; i < 7; i++) { const date = new Date(since); date.setDate(since.getDate() + i); dayMap.set(date.toISOString().slice(0, 10), { date: date.toISOString().slice(0, 10), label: date.toLocaleDateString("en-IN", { weekday: "short" }), attempts: 0, averagePercent: 0, percentTotal: 0 }); }
    for (const a of attempts) { const item = dayMap.get(new Date(a.createdAt).toISOString().slice(0, 10)); if (item) { item.attempts += 1; item.percentTotal += Number(a.percent) || 0; } }
    const activity = Array.from(dayMap.values()).map((x) => ({ ...x, averagePercent: x.attempts ? Math.round(x.percentTotal / x.attempts) : 0 }));
    return res.json({ success: true, data: { activity, totals: { attempts: average[0]?.attempts || 0, averagePercent: Math.round(average[0]?.averagePercent || 0), pendingReviews: 0 }, examStatuses: Object.fromEntries(statusCounts.map((x) => [x._id, x.count])) } });
  } catch (error) { next(error); }
};

const updateUserStatus = async (req, res, next) => {
  if (!requirePrincipal(req, res)) return;
  try {
    if (String(req.params.id) === String(req.auth.sub)) return res.status(400).json({ success: false, message: "You cannot deactivate your own Principal account." });
    const user = await User.findById(req.params.id);
    if (!user || !["teacher", "student"].includes(user.role)) return res.status(404).json({ success: false, message: "User not found." });
    user.isActive = Boolean(req.body.isActive); await user.save();
    return res.json({ success: true, message: (user.role === "teacher" ? "Teacher" : "Student") + " account " + (user.isActive ? "activated" : "deactivated") + ".", data: { id: user._id, isActive: user.isActive, status: user.isActive ? "Active" : "Inactive" } });
  } catch (error) { next(error); }
};

module.exports = { getOverview, listTeachers, listStudents, listExams, listPapers, listQuestions, getAnalytics, updateUserStatus };