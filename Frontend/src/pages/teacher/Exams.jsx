import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import ExamCreateModal from "../../components/teacher/ExamCreateModal";
import { useData } from "../../context/DataContext";

export default function Exams() {
  const [open, setOpen] = useState(false);
  const { exams } = useData();

  return (
    <>
      <PageHeader
        eyebrow={exams.length + " exams"}
        title="Exams"
        description="Create exams from your question papers, control access and track participation."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus />
            New exam
          </Button>
        }
      />

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Questions</th>
                <th>Modes</th>
                <th>Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.length ? (
                exams.map((exam) => (
                  <tr key={exam.examId}>
                    <td>
                      <strong>{exam.name}</strong>
                    </td>
                    <td>{exam.questions}</td>
                    <td>{exam.modes.join(" + ") || "—"}</td>
                    <td>{exam.students}</td>
                    <td>
                      <span className={"status " + (exam.status === "Live" ? "green" : "")}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No exams have been created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && <ExamCreateModal onClose={() => setOpen(false)} />}
    </>
  );
}
