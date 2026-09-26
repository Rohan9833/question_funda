import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  Plus,
  UploadCloud,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import ExcelImportModal from "../../components/teacher/ExcelImportModal";
import PaperGeneratorModal from "../../components/teacher/PaperGeneratorModal";
export default function Dashboard() {
  const [u, setU] = useState(false),
    [g, setG] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Teacher workspace"
        title="Build better exams, faster."
        description="Manage your question bank and create polished NEET papers."
        actions={
          <>
            <Button variant="secondary" onClick={() => setU(true)}>
              <UploadCloud />
              Import Excel
            </Button>
            <Button onClick={() => setG(true)}>
              <Plus />
              Generate Paper
            </Button>
          </>
        }
      />
      <div className="stat-grid">
        <StatCard
          icon={BookOpen}
          label="Question Bank"
          value="1,248"
          note="+86 this month"
        />
        <StatCard
          icon={FileText}
          label="Question Papers"
          value="24"
          note="6 drafts"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Active Exams"
          value="8"
          note="312 students"
        />
        <StatCard
          icon={BarChart3}
          label="Average Score"
          value="72.4%"
          note="+4.8% this month"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Recent papers</h2>
          </div>
          {[
            "NEET Biology — Full Mock 01",
            "Physics — Mechanics Test",
            "Chemistry — Organic Basics",
          ].map((x, i) => (
            <div className="list-row" key={x}>
              <FileText />
              <span>
                <strong>{x}</strong>
                <small>{i ? 45 : 180} questions</small>
              </span>
              <b>{i === 2 ? "Draft" : "Published"}</b>
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Question bank</h2>
          </div>
          {[
            ["Biology", 486],
            ["Physics", 402],
            ["Chemistry", 360],
          ].map((x) => (
            <div className="subject-row" key={x[0]}>
              <span>{x[0]}</span>
              <strong>{x[1]}</strong>
            </div>
          ))}
        </section>
      </div>
      {u && <ExcelImportModal onClose={() => setU(false)} />}{" "}
      {g && <PaperGeneratorModal onClose={() => setG(false)} />}
    </>
  );
}
