import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Users, X } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { papersApi } from "../../api/papers.api";
import { examsApi } from "../../api/exams.api";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function AttemptModal({ detail, onClose }) {
  const counts = detail?.counts || {};
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal !max-w-5xl !max-h-[90vh] !overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">Student attempt</span>
            <h2>{detail?.student?.name || "Student"}</h2>
            <p>{detail?.student?.email || ""} · {detail?.percent || 0}% · {detail?.score || 0}/{detail?.total || 0}</p>
          </div>
          <button className="icon-btn" onClick={onClose} type="button"><X size={18}/></button>
        </div>
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="stat-card"><span>Attempted</span><strong>{counts.attempted || 0}</strong></div>
          <div className="stat-card"><span>Correct</span><strong>{counts.correct || 0}</strong></div>
          <div className="stat-card"><span>Wrong</span><strong>{counts.wrong || 0}</strong></div>
          <div className="stat-card"><span>Missed</span><strong>{counts.missed || 0}</strong></div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-5">
          <div className="space-y-3">
            {(detail?.questions || []).map((question) => (
              <article key={question.questionId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400">Q{question.number}</span>
                    <h3 className="mt-1 text-sm font-semibold leading-6 text-slate-800">{question.text}</h3>
                  </div>
                  <span className={question.status === "correct" ? "status green" : question.status === "wrong" ? "status amber" : "status"}>{question.status}</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3 text-xs">
                    <span className="muted">Student answer</span>
                    <strong className="mt-1 block">
                      {question.selectedAnswer == null ? "Left blank" : String.fromCharCode(65 + question.selectedAnswer) + ". " + (question.options[question.selectedAnswer]?.text || "")}
                    </strong>
                  </div>
                  <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-xs">
                    <span className="text-green-600">Correct answer</span>
                    <strong className="mt-1 block text-green-800">
                      {String.fromCharCode(65 + question.correctAnswer) + ". " + (question.options[question.correctAnswer]?.text || "")}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="modal-footer"><Button variant="secondary" onClick={onClose}>Close</Button></div>
      </section>
    </div>
  );
}

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [paperResponse, performanceResponse] = await Promise.all([papersApi.get(id), papersApi.performance(id)]);
        setPaper(paperResponse.data?.data || null);
        setPerformance(performanceResponse.data?.data || null);
      } catch (e) {
        setError(e.response?.data?.message || e.message || "Could not load this paper.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const openAttempt = async (row) => {
    try {
      setSelectedAttempt(row);
      setLoadingDetail(true);
      const response = await examsApi.attemptDetail(row.examId, row.attemptId);
      setDetail(response.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load the attempt.");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return <div className="empty-state"><span>Loading question paper...</span></div>;
  if (error && !paper) return <div className="empty-state"><strong>Unable to load paper</strong><span>{error}</span><button className="btn secondary" onClick={() => navigate(-1)}>Go back</button></div>;

  const p = paper?.paper || {};
  const attempts = performance?.attempts || [];

  return (
    <>
      <PageHeader
        eyebrow="Question paper"
        title={p.name || "Question Paper"}
        description={(p.subject || "Mixed") + " · " + (p.questions || 0) + " questions · " + (p.duration || 0) + " minutes"}
        actions={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft size={15}/>Back</Button>}
      />

      <div className="stat-grid">
        <div className="stat-card"><span>Questions</span><strong>{p.questions || 0}</strong></div>
        <div className="stat-card"><span>Attempts</span><strong>{performance?.totals?.attempts || 0}</strong></div>
        <div className="stat-card"><span>Students</span><strong>{performance?.totals?.students || 0}</strong></div>
        <div className="stat-card"><span>Average score</span><strong>{performance?.totals?.averagePercent || 0}%</strong></div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head"><div><h2>Student attempts</h2><span className="muted">Every submitted attempt for exams created from this paper.</span></div><Users size={18}/></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Percentage</th><th>Date</th></tr></thead>
              <tbody>
                {attempts.length ? attempts.map((row) => (
                  <tr key={row.attemptId} className="cursor-pointer" onClick={() => openAttempt(row)}>
                    <td><strong>{row.student?.name || "Unknown"}</strong><span className="block muted">{row.student?.studentId || row.student?.email || "—"}</span></td>
                    <td>{row.examName}</td>
                    <td><strong>{row.score}/{row.total}</strong></td>
                    <td>{row.percent}%</td>
                    <td>{formatDate(row.createdAt)}</td>
                  </tr>
                )) : <tr><td colSpan="5">No students have attempted this paper yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><h2>Questions</h2><span className="muted">The exact questions and options stored in this paper.</span></div><FileText size={18}/></div>
          <div className="space-y-3">
            {(paper?.questions || []).map((question) => (
              <article key={question._id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-500">Q{question.number}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-6 text-slate-800">{question.text}</h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {(question.options || []).map((option) => (
                        <div key={option.key} className={option.key === question.correctAnswer ? "rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800" : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"}>
                          <span className="mr-2 font-extrabold">{option.key}.</span>{option.text}
                          {option.key === question.correctAnswer && <CheckCircle2 size={13} className="ml-2 inline text-green-600"/>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {selectedAttempt && (loadingDetail || detail) && (
        loadingDetail
          ? <div className="modal-backdrop"><div className="modal"><div className="empty-state">Loading student attempt...</div></div></div>
          : <AttemptModal detail={detail} onClose={() => { setSelectedAttempt(null); setDetail(null); }} />
      )}
    </>
  );
}
