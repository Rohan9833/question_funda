import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Clock3, Eye } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import PaperGeneratorModal from "../../components/teacher/PaperGeneratorModal";
import { useData } from "../../context/DataContext";

export default function QuestionPapers() {
  const [open, setOpen] = useState(false);
  const { papers } = useData();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        eyebrow={papers.length + " papers"}
        title="Question Papers"
        description="Create, review and inspect papers with real questions and student attempts."
        actions={<Button onClick={() => setOpen(true)}><Plus/>Generate paper</Button>}
      />
      <div className="paper-grid">
        {papers.map((p) => (
          <button key={p.id} type="button" className="paper-card !text-left" onClick={() => navigate("/teacher/papers/" + p.id)}>
            <FileText/>
            <h3>{p.name}</h3>
            <p>{p.questions} questions</p>
            <div><Clock3/> {p.duration} min · {p.status}</div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-green-600"><Eye size={13}/>Open paper</span>
          </button>
        ))}
      </div>
      {!papers.length && <div className="empty-state">No question papers have been generated yet.</div>}
      {open && <PaperGeneratorModal onClose={() => setOpen(false)} />}
    </>
  );
}
