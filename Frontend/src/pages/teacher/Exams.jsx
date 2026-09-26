import PageHeader from "../../components/common/PageHeader";
import { Plus } from "lucide-react";
import Button from "../../components/common/Button";
import { exams } from "../../utils/mockData";
export default function Exams() {
  return (
    <>
      <PageHeader
        eyebrow="8 active exams"
        title="Exams"
        description="Control access and track participation."
        actions={
          <Button>
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
              {exams.map((e) => (
                <tr key={e.examId}>
                  <td>
                    <strong>{e.name}</strong>
                  </td>
                  <td>{e.questions}</td>
                  <td>{e.modes.join(" + ")}</td>
                  <td>{e.students}</td>
                  <td>
                    <span className="status green">Live</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
