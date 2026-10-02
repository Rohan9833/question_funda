import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardCheck, MinusCircle, Users, X, XCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { examsApi } from "../../api/exams.api";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function AttemptReview({ detail, onClose }) {
  const counts = detail?.counts || {};
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal !max-w-5xl !max-h-[90vh] !overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><span className="eyebrow">Student performance</span><h2>{detail?.student?.name || "Student"}</h2><p>{detail?.student?.email || ""} · {detail?.percent || 0}%</p></div>
          <button className="icon-btn" onClick={onClose} type="button"><X size={18}/></button>
        </div>
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="stat-card"><span>Attempted</span><strong>{counts.attempted || 0}</strong></div>
          <div className="stat-card"><span>Correct</span><strong>{counts.correct || 0}</strong></div>
          <div className="stat-card"><span>Wrong</span><strong>{counts.wrong || 0}</strong></div>
          <div className="stat-card"><span>Missed</span><strong>{counts.missed || 0}</strong></div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-5 space-y-3">
          {(detail?.questions || []).map((question) => (
            <article key={question.questionId} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><span className="text-[10px] font-extrabold text-slate-400">Q{question.number}</span><h3 className="mt-1 text-sm font-semibold leading-6 text-slate-800">{question.text}</h3></div>
                <span className={question.status === "correct" ? "status green" : question.status === "wrong" ? "status amber" : "status"}>{question.status}</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="muted">Student answer</span><strong className="mt-1 block">{question.selectedAnswer == null ? "Left blank" : String.fromCharCode(65 + question.selectedAnswer) + ". " + (question.options[question.selectedAnswer]?.text || "")}</strong></div>
                <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-xs"><span className="text-green-600">Correct answer</span><strong className="mt-1 block text-green-800">{String.fromCharCode(65 + question.correctAnswer) + ". " + (question.options[question.correctAnswer]?.text || "")}</strong></div>
              </div>
            </article>
          ))}
        </div>
        <div className="modal-footer"><Button variant="secondary" onClick={onClose}>Close</Button></div>
      </section>
    </div>
  );
}

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    examsApi.performance(id)
      .then((response) => setData(response.data?.data || null))
      .catch((e) => setError(e.response?.data?.message || e.message || "Could not load exam."))
      .finally(() => setLoading(false));
  }, [id]);

  const openAttempt = async (row) => {
    setSelected(row);
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await examsApi.attemptDetail(id, row.attemptId);
      setDetail(response.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load student performance.");
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div className="empty-state">Loading exam performance...</div>;
  if (error && !data) return <div className="empty-state"><strong>Unable to load exam</strong><span>{error}</span><button className="btn secondary" onClick={() => navigate(-1)}>Go back</button></div>;

  const exam = data?.exam || {};
  const totals = data?.totals || {};
  const attempts = data?.attempts || [];

  return (
    <>
      <PageHeader eyebrow="Exam performance" title={exam.name || "Exam"} description={(exam.questions || 0) + " questions · " + (exam.duration || 0) + " minutes · " + (exam.status || "Draft")} actions={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft size={15}/>Back</Button>}/>
      <div className="stat-grid">
        <div className="stat-card"><ClipboardCheck/><span>Attempts</span><strong>{totals.attempts || 0}</strong></div>
        <div className="stat-card"><CheckCircle2/><span>Correct</span><strong>{totals.correct || 0}</strong></div>
        <div className="stat-card"><XCircle/><span>Wrong</span><strong>{totals.wrong || 0}</strong></div>
        <div className="stat-card"><MinusCircle/><span>Missed</span><strong>{totals.missed || 0}</strong></div>
      </div>
      <section className="panel">
        <div className="panel-head"><div><h2>Students who attempted</h2><span className="muted">Click a student to inspect every question.</span></div><Users size={18}/></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Score</th><th>Attempted</th><th>Correct</th><th>Wrong</th><th>Missed</th><th>Date</th></tr></thead>
            <tbody>
              {attempts.length ? attempts.map((row) => (
                <tr key={row.attemptId} className="cursor-pointer" onClick={() => openAttempt(row)}>
                  <td><strong>{row.student?.name || "Unknown"}</strong><span className="block muted">{row.student?.studentId || row.student?.email || "—"}</span></td>
                  <td><strong>{row.score}/{row.total}</strong><span className="block muted">{row.percent}%</span></td>
                  <td>{row.attempted}</td><td>{row.correct}</td><td>{row.wrong}</td><td>{row.missed}</td><td>{formatDate(row.createdAt)}</td>
                </tr>
              )) : <tr><td colSpan="7">No student has attempted this exam yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (detailLoading ? <div className="modal-backdrop"><div className="modal"><div className="empty-state">Loading student performance...</div></div></div> : detail ? <AttemptReview detail={detail} onClose={() => { setSelected(null); setDetail(null); }} /> : null)}
    </>
  );
}
