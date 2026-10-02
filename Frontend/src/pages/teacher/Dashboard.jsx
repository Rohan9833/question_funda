import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  Plus,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import ExcelImportModal from "../../components/teacher/ExcelImportModal";
import PaperGeneratorModal from "../../components/teacher/PaperGeneratorModal";
import { teacherApi } from "../../api/teacher.api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (refresh = false) => {
    try {
      setError("");
      refresh ? setRefreshing(true) : setLoading(true);
      const response = await teacherApi.dashboard();
      setDashboard(response.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="empty-state"><span>Loading your dashboard...</span></div>;
  if (error || !dashboard) return <div className="empty-state"><strong>Unable to load dashboard</strong><span>{error || "Dashboard data is unavailable."}</span><button className="btn secondary" onClick={() => load()}>Try again</button></div>;

  const stats = dashboard.stats || {};

  return (
    <>
      <PageHeader
        eyebrow="Teacher workspace"
        title="Build better exams, faster."
        description="Manage your question bank and create polished NEET papers."
        actions={
          <>
            <Button variant="secondary" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw className={refreshing ? "spin" : ""} /> Refresh
            </Button>
            <Button variant="secondary" onClick={() => setUploadOpen(true)}>
              <UploadCloud /> Import Excel
            </Button>
            <Button onClick={() => setGenerateOpen(true)}>
              <Plus /> Generate Paper
            </Button>
          </>
        }
      />

      <div className="stat-grid">
        <StatCard icon={BookOpen} label="Question Bank" value={stats.questions || 0} note="Questions created by you" />
        <StatCard icon={FileText} label="Question Papers" value={stats.totalPapers || 0} note={(stats.drafts || 0) + " drafts"} />
        <StatCard icon={ClipboardCheck} label="Active Exams" value={stats.activeExams || 0} note={(stats.students || 0) + " students attempted"} />
        <StatCard icon={BarChart3} label="Average Score" value={(stats.averagePercent || 0) + "%"} note={(stats.attempts || 0) + " submitted attempts"} />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div><h2>Recent papers</h2><span className="muted">Your latest generated question papers</span></div>
          </div>
          {(dashboard.recentPapers || []).length ? dashboard.recentPapers.map((paper) => (
            <button key={paper.id} type="button" className="list-row !w-full !text-left" onClick={() => navigate("/teacher/papers/" + paper.id)}>
              <FileText />
              <span>
                <strong>{paper.name}</strong>
                <small>{paper.questions} questions · {paper.subject || "Mixed"}</small>
              </span>
              <b>{paper.status}</b>
            </button>
          )) : <div className="empty-state">No question papers yet.</div>}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div><h2>Question bank</h2><span className="muted">Real question counts by subject</span></div>
          </div>
          {(dashboard.questionBank || []).length ? dashboard.questionBank.map((item) => (
            <div className="subject-row" key={item.subject}>
              <span>{item.subject}</span>
              <strong>{item.count}</strong>
            </div>
          )) : <div className="empty-state">No questions yet.</div>}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div><h2>Recent exams</h2><span className="muted">Click an exam to review student performance.</span></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Exam</th><th>Questions</th><th>Students</th><th>Status</th></tr></thead>
            <tbody>
              {(dashboard.exams || []).length ? dashboard.exams.map((exam) => (
                <tr key={exam.id} className="cursor-pointer" onClick={() => navigate("/teacher/exams/" + exam.id)}>
                  <td><strong>{exam.name}</strong></td><td>{exam.questions}</td><td>{exam.students}</td><td><span className={"status " + (exam.status === "Live" ? "green" : "")}>{exam.status}</span></td>
                </tr>
              )) : <tr><td colSpan="4">No exams yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {uploadOpen && <ExcelImportModal onClose={() => { setUploadOpen(false); load(true); }} />}
      {generateOpen && <PaperGeneratorModal onClose={() => { setGenerateOpen(false); load(true); }} />}
    </>
  );
}
