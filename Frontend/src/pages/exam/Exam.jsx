import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Clock3, Sparkles } from "lucide-react";
import { examsApi } from "../../api/questions.api";
import { useData } from "../../context/DataContext";
import useExam from "../../hooks/useExam";
import QuestionPalette from "../../components/exam/QuestionPalette";
import QuestionCard from "../../components/exam/QuestionCard";
import Button from "../../components/common/Button";

const mapQuestion = (question) => ({
  id: question._id,
  text: question.text,
  options: (question.options || []).map((option) => option.text),
});

export default function Exam() {
  const [params] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = params.get("mode") === "paper" ? "paper" : "online";
  const { submitExam } = useData();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const examState = useExam(questions);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await examsApi.get(id);

        if (!active) return;

        setExam(response.data.data.exam);
        setQuestions(response.data.data.questions.map(mapQuestion));
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Could not load this exam."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const finish = async () => {
    if (submitting || !exam) return;

    setSubmitting(true);
    setError("");

    try {
      const answers = Object.entries(examState.answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      await submitExam(exam._id, answers);
      navigate("/student/results");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Could not submit the exam."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="exam-shell"><div className="question-card"><h1>Loading exam...</h1></div></div>;
  }

  if (error || !exam) {
    return (
      <div className="exam-shell">
        <div className="question-card">
          <h1>{error || "Exam not found."}</h1>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-shell">
      <header className="exam-top">
        <div className="brand">
          <div className="brand-mark"><Sparkles /></div>
          <strong>Question Funda</strong>
        </div>

        <div className="exam-title">
          <span>{mode.toUpperCase()} EXAM</span>
          <strong>{exam.name}</strong>
        </div>

        <div className="exam-time">
          <Clock3 />
          {exam.duration} min
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Exit
          </Button>
        </div>
      </header>

      <div className="exam-body">
        <aside className="question-nav">
          <h3>Question palette</h3>
          <p>
            {mode === "online"
              ? "Select an answer for each question."
              : "Write answers on the physical answer sheet."}
          </p>
          <QuestionPalette
            total={questions.length}
            current={examState.index}
            answers={examState.answers}
            onSelect={examState.go}
          />
        </aside>

        <section className="exam-question">
          <div className="question-meta">
            Question {questions.length ? examState.index + 1 : 0} of{" "}
            {questions.length}
          </div>

          {examState.current ? (
            <QuestionCard
              q={examState.current}
              mode={mode}
              selected={examState.answers[examState.current.id]}
              onSelect={examState.select}
            />
          ) : (
            <div className="question-card">
              <h1>No questions available for this exam.</h1>
            </div>
          )}

          {error && <div role="alert">{error}</div>}

          <div className="exam-nav">
            <Button variant="secondary" onClick={examState.previous}>
              Previous
            </Button>
            <Button
              onClick={
                examState.index === questions.length - 1
                  ? finish
                  : examState.next
              }
              disabled={submitting || !questions.length}
            >
              {submitting
                ? "Submitting..."
                : examState.index === questions.length - 1
                  ? "Finish & Submit"
                  : "Next"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
