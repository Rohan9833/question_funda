import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  const teacherNav = [
    ["/teacher/dashboard", "Dashboard", LayoutDashboard],
    ["/teacher/questions", "Question Bank", BookOpen],
    ["/teacher/papers", "Question Papers", FileText],
    ["/teacher/exams", "Exams", ClipboardCheck],
    ["/teacher/students", "Students", Users],
    ["/teacher/analytics", "Analytics", BarChart3],
  ];

  const studentNav = [
    ["/student/dashboard", "Dashboard", LayoutDashboard],
    ["/student/exams", "Available Exams", GraduationCap],
    ["/student/results", "My Results", BarChart3],
  ];

  const navItems = user.role === "teacher" ? teacherNav : studentNav;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles />
        </div>
        <div>
          <strong>Question Funda</strong>
          <span>Exam workspace</span>
        </div>
      </div>

      <div className="role-badge">{user.role} workspace</div>

      <nav>
        {navItems.map(([to, name, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              "nav-item " + (isActive ? "active" : "")
            }
          >
            <Icon />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-mini">
          <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
