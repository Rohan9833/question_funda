import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  ClipboardCheck,
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { studentsApi } from "../../api/students.api";

const formatDate = (value) => {
  if (!value) return "No activity";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No activity";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "ST";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    averagePercent: 0,
    activeStudents: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await studentsApi.list({
        search: search.trim(),
        page: 1,
        limit: 100,
      });

      const payload = response.data?.data || {};

      setStudents(Array.isArray(payload.students) ? payload.students : []);
      setSummary(
        payload.summary || {
          totalStudents: 0,
          totalAttempts: 0,
          averagePercent: 0,
          activeStudents: 0,
        }
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load students. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadStudents]);

  return (
    <>
      <PageHeader
        eyebrow={summary.totalStudents + " students"}
        title="Students"
        description="See the students who have participated in your exams and track their performance."
        actions={
          <button
            className="btn secondary"
            type="button"
            onClick={() => loadStudents(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw size={14} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        }
      />

      <div className="stat-grid student-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={17} />
          </div>
          <span>Total students</span>
          <strong>{summary.totalStudents}</strong>
          <small>Students who attempted your exams</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ClipboardCheck size={17} />
          </div>
          <span>Exam attempts</span>
          <strong>{summary.totalAttempts}</strong>
          <small>Total submissions across your exams</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={17} />
          </div>
          <span>Average performance</span>
          <strong>{summary.averagePercent}%</strong>
          <small>Across all student attempts</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <UserCheck size={17} />
          </div>
          <span>Active accounts</span>
          <strong>{summary.activeStudents}</strong>
          <small>Currently active student accounts</small>
        </div>
      </div>

      <div className="filter-bar">
        <label className="search">
          <Search size={14} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, student ID or school..."
            aria-label="Search students"
          />
        </label>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Student list</h2>
            <span className="block muted">
              {search
                ? students.length + " matching students"
                : "Students from your exam participation"}
            </span>
          </div>
        </div>

        {error ? (
          <div className="empty-state">
            <strong>Unable to load students</strong>
            <span>{error}</span>
            <button
              className="btn secondary"
              type="button"
              onClick={() => loadStudents()}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="empty-state">
            <span>Loading students...</span>
          </div>
        ) : students.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Class / School</th>
                  <th>Exams</th>
                  <th>Average</th>
                  <th>Last activity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="table-title">
                        <div className="avatar">{initials(student.name)}</div>
                        <div>
                          <strong>{student.name}</strong>
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{student.studentId}</td>

                    <td>
                      <strong>{student.standard || "—"}</strong>
                      <span className="block muted">
                        {student.schoolName || student.board || "—"}
                      </span>
                    </td>

                    <td>
                      <strong>{student.examsCompleted}</strong>
                      <span className="block muted">
                        {student.attempts} attempt
                        {student.attempts === 1 ? "" : "s"}
                      </span>
                    </td>

                    <td>
                      <strong>{student.averagePercent}%</strong>
                    </td>

                    <td>
                      <span className="table-title">
                        <CalendarClock size={13} />
                        {formatDate(student.lastActiveAt)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          "status " + (student.isActive ? "green" : "amber")
                        }
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Users size={28} />
            <strong>{search ? "No students found" : "No students yet"}</strong>
            <span>
              {search
                ? "Try a different search term."
                : "Students will appear here after they participate in one of your exams."}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
