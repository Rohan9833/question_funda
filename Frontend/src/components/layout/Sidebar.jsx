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
  Database,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  const principalNav = [
    ["/principal/dashboard", "Overview", LayoutDashboard],
    ["/principal/teachers", "Teachers", Users],
    ["/principal/students", "Students", GraduationCap],
    ["/principal/exams", "Exams", ClipboardCheck],
    ["/principal/papers", "Question Papers", FileText],
    ["/principal/questions", "Question Bank", BookOpen],
    ["/principal/analytics", "Analytics", BarChart3],
  ];

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

  const navItems =
    user.role === "admin" ? principalNav : user.role === "teacher" ? teacherNav : studentNav;

  const workspace = user.role === "admin" ? "Principal workspace" : `${user.role} workspace`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Sparkles /></div>
        <div>
          <strong>Question Funda</strong>
          <span>Examination platform</span>
        </div>
      </div>

      <div className="role-badge">
        {user.role === "admin" ? "Principal workspace" : workspace}
      </div>

      {user.role === "admin" && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-900/40 bg-green-950/30 px-3 py-2 text-[9px] font-bold text-green-300">
          <ShieldCheck size={13} />
          Full system access
        </div>
      )}

      <nav>
        {navItems.map(([to, name, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => "nav-item " + (isActive ? "active" : "")}
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
            <span>{user.role === "admin" ? "Principal" : user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
