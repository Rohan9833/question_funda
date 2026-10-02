import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Profile from "./pages/auth/Profile";
import TD from "./pages/teacher/Dashboard";
import QB from "./pages/teacher/QuestionBank";
import QP from "./pages/teacher/QuestionPapers";
import QPD from "./pages/teacher/PaperDetail";
import TED from "./pages/teacher/ExamDetail";
import TE from "./pages/teacher/Exams";
import TS from "./pages/teacher/Students";
import TA from "./pages/teacher/Analytics";
import SD from "./pages/student/Dashboard";
import AE from "./pages/student/AvailableExams";
import SR from "./pages/student/Results";
import Exam from "./pages/exam/Exam";
import PrincipalDashboard from "./pages/principal/PrincipalDashboard";

export default function App() {
  const { user } = useAuth();

  const homePath = user
    ? user.role === "admin"
      ? "/principal/dashboard"
      : user.role === "teacher"
        ? "/teacher/dashboard"
        : "/student/dashboard"
    : "/login";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<Profile />} />

          {user?.role === "admin" ? (
            <>
              <Route path="/principal" element={<Navigate to="/principal/dashboard" replace />} />
              <Route path="/principal/:section" element={<PrincipalDashboard />} />
            </>
          ) : user?.role === "teacher" ? (
            <>
              <Route path="/teacher" element={<Navigate to="/teacher/dashboard" />} />
              <Route path="/teacher/dashboard" element={<TD />} />
              <Route path="/teacher/questions" element={<QB />} />
              <Route path="/teacher/papers" element={<QP />} />
              <Route path="/teacher/papers/:id" element={<QPD />} />
              <Route path="/teacher/exams" element={<TE />} />
              <Route path="/teacher/exams/:id" element={<TED />} />
              <Route path="/teacher/students" element={<TS />} />
              <Route path="/teacher/analytics" element={<TA />} />
            </>
          ) : (
            <>
              <Route path="/student" element={<Navigate to="/student/dashboard" />} />
              <Route path="/student/dashboard" element={<SD />} />
              <Route path="/student/exams" element={<AE />} />
              <Route path="/student/results" element={<SR />} />
            </>
          )}
        </Route>

        <Route path="/exam/:id" element={<Exam />} />
      </Route>

      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}
