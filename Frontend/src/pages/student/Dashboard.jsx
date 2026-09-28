import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import StatCard from "../../components/common/StatCard";
import { studentsApi } from "../../api/students.api";

const formatMinutes = (minutes = 0) => {
  const value = Number(minutes) || 0;

  if (value < 60) {
    return value + "m";
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await studentsApi.dashboard();
      setDashboard(response.data?.data || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load your dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="empty-state">
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="empty-state">
        <strong>Unable to load dashboard</strong>
        <span>{error || "Dashboard data is unavailable."}</span>
        <button
          className="btn secondary"
          type="button"
          onClick={() => loadDashboard()}
        >
          Try again
        </button>
      </div>
    );
  }

  const {
    student,
    upcomingExam,
    stats,
    recentResults = [],
  } = dashboard;

  return (
    <>
      <PageHeader
        eyebrow="Student workspace"
        title={`Welcome back, ${student.name.split(" ")[0]}.`}
        description="Continue an active exam or review your recent performance."
        actions={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "spin" : ""} />
              Refresh
            </Button>
            <Button type="button" onClick={() => navigate("/student/exams")}>
              <GraduationCap size={15} />
              View exams
            </Button>
          </>
        }
      />

      {upcomingExam ? (
        <div className="student-hero">
          <div>
            <span className="pill">UPCOMING EXAM</span>
            <h2>{upcomingExam.name}</h2>
            <p>
              {upcomingExam.questions} questions · {upcomingExam.marks} marks ·{" "}
              {upcomingExam.duration} minutes
            </p>

            <div className="hero-meta">
              <span>
                <ClipboardCheck size={12} />
                {upcomingExam.questions} questions
              </span>
              <span>
                <Clock3 size={12} />
                {upcomingExam.duration} minutes
              </span>
              <span>
                <BookOpen size={12} />
                {upcomingExam.modes?.join(" / ") || "Online"}
              </span>
            </div>

            <button
              className="btn primary"
              type="button"
              style={{ marginTop: 18 }}
              onClick={() => navigate(`/exam/${upcomingExam.id}`)}
            >
              Start exam
            </button>
          </div>

          <div className="hero-score">
            <span>Your average</span>
            <strong>
              {stats.averagePercent}<span>%</span>
            </strong>
            <em>
              {stats.completed
                ? "Based on completed exams"
                : "Complete your first exam"}
            </em>
          </div>
        </div>
      ) : (
        <div className="student-hero">
          <div>
            <span className="pill">NO LIVE EXAMS</span>
            <h2>No exam is currently available.</h2>
            <p>
              New exams published by your teachers will appear here.
            </p>
          </div>

          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/student/exams")}
          >
            <GraduationCap size={15} />
            View exams
          </Button>
        </div>
      )}

      <div className="stat-grid">
        <StatCard
          icon={ClipboardCheck}
          label="Completed"
          value={stats.completed}
          note={`${stats.completedThisWeek} this week`}
        />
        <StatCard
          icon={BarChart3}
          label="Average score"
          value={`${stats.averagePercent}%`}
          note="Across completed exams"
        />
        <StatCard
          icon={Clock3}
          label="Practice time"
          value={formatMinutes(stats.practiceMinutes)}
          note="Total exam time"
        />
        <StatCard
          icon={BookOpen}
          label="Solved"
          value={stats.solvedQuestions.toLocaleString("en-IN")}
          note={`${stats.accuracy}% accuracy`}
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent results</h2>
              <span className="block muted">
                Your latest completed exams
              </span>
            </div>

            <button
              className="text-btn"
              type="button"
              onClick={() => navigate("/student/results")}
            >
              View all
            </button>
          </div>

          {recentResults.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentResults.map((result) => (
                    <tr key={result.id}>
                      <td>
                        <div className="table-title">
                          <div className="doc-icon">
                            <CheckCircle2 size={15} />
                          </div>
                          <div>
                            <strong>{result.name}</strong>
                            <span>Completed exam</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>
                          {result.score}/{result.total}
                        </strong>
                      </td>
                      <td>
                        <span className="status green">
                          {result.percent}%
                        </span>
                      </td>
                      <td>
                        <span className="table-title">
                          <CalendarClock size={13} />
                          {formatDate(result.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <TrendingUp size={25} />
              <strong>No results yet</strong>
              <span>Complete an exam to see your performance here.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
