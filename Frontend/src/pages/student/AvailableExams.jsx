import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { useData } from "../../context/DataContext";

export default function AvailableExams() {
  const navigate = useNavigate();
  const { exams } = useData();

  return (
    <>
      <PageHeader
        eyebrow={exams.length + " exams available"}
        title="Available Exams"
        description="Choose a live exam and attempt it online or on paper."
      />

      <div className="exam-list">
        {exams.length ? (
          exams.map((exam) => (
            <article className="exam-card" key={exam.examId}>
              <div>
                <span className="pill">NEET 2026</span>
                <h2>{exam.name}</h2>
                <p>
                  {exam.questions} questions · {exam.duration} minutes ·{" "}
                  {exam.marks} marks
                </p>
              </div>

              <div className="exam-start">
                {exam.modes.includes("Online") && (
                  <Button
                    onClick={() =>
                      navigate("/exam/" + exam.examId + "?mode=online")
                    }
                  >
                    Start online
                  </Button>
                )}

                {exam.modes.includes("Paper") && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      navigate("/exam/" + exam.examId + "?mode=paper")
                    }
                  >
                    Paper mode
                  </Button>
                )}
              </div>
            </article>
          ))
        ) : (
          <article className="exam-card">
            <div>
              <span className="pill">No live exams</span>
              <h2>No exams are currently available.</h2>
              <p>Check again after your teacher publishes an exam.</p>
            </div>
          </article>
        )}
      </div>
    </>
  );
}
