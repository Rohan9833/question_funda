import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { examsApi } from "../../api/questions.api";
import { CheckCircle2, XCircle, MinusCircle, X } from "lucide-react";
import { useData } from "../../context/DataContext";

const statusMeta = {
  correct: {
    label: "Correct",
    className: "result-question correct",
    Icon: CheckCircle2,
  },
  wrong: {
    label: "Wrong",
    className: "result-question wrong",
    Icon: XCircle,
  },
  missed: {
    label: "Missed",
    className: "result-question missed",
    Icon: MinusCircle,
  },
};

export default function Results() {
  const { results } = useData();
  const [selectedResult, setSelectedResult] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openResult = async (result) => {
    setSelectedResult(result);
    setDetail(null);
    setError("");
    setLoading(true);

    try {
      const response = await examsApi.resultDetail(result.id);
      setDetail(response.data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Could not load the result details."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeResult = () => {
    setSelectedResult(null);
    setDetail(null);
    setError("");
  };

  return (
    <>
      <PageHeader
        eyebrow={results.length + " completed"}
        title="My Results"
        description="Track your results from completed exams."
      />

      <div className="result-grid">
        {results.length ? (
          results.map((result) => (
            <button
              className="result-card result-card-clickable"
              key={result.id}
              onClick={() => openResult(result)}
              type="button"
            >
              <span className="pill">Completed</span>
              <h3>{result.name}</h3>
              <strong>
                {result.score}/{result.total}
              </strong>
              <em>{result.percent}%</em>
              <span className="result-view-link">View answers →</span>
            </button>
          ))
        ) : (
          <article className="result-card">
            <span className="pill">No attempts yet</span>
            <h3>Complete an exam to see your result here.</h3>
          </article>
        )}
      </div>

      {selectedResult && (
        <div className="modal-backdrop" onClick={closeResult}>
          <section
            className="modal result-review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>{detail?.name || selectedResult.name}</h2>
                <p>
                  {detail
                    ? `${detail.score}/${detail.total} • ${detail.percent}%`
                    : "Reviewing your answers..."}
                </p>
              </div>

              <button
                className="icon-btn"
                type="button"
                onClick={closeResult}
                aria-label="Close result review"
              >
                <X size={16} />
              </button>
            </div>

            {loading ? (
              <div className="result-review-loading">
                Loading answer review...
              </div>
            ) : error ? (
              <div className="result-review-error">{error}</div>
            ) : detail ? (
              <div className="result-review-list">
                {detail.questions.map((question) => {
                  const meta = statusMeta[question.status] || statusMeta.missed;
                  const Icon = meta.Icon;

                  return (
                    <article className={meta.className} key={question.questionId}>
                      <div className="result-question-head">
                        <div>
                          <span className="result-question-number">
                            Q{question.number}
                          </span>
                          <strong>{question.text}</strong>
                        </div>

                        <span className="result-question-status">
                          <Icon size={15} />
                          {meta.label}
                        </span>
                      </div>

                      <div className="result-answer-summary">
                        <div>
                          <span>Your answer</span>
                          <strong>
                            {question.selectedAnswer == null
                              ? "Not answered"
                              : `${String.fromCharCode(65 + question.selectedAnswer)}. ${question.options[question.selectedAnswer]}`}
                          </strong>
                        </div>

                        <div>
                          <span>Correct answer</span>
                          <strong>
                            {String.fromCharCode(65 + question.correctAnswer)}.{" "}
                            {question.options[question.correctAnswer]}
                          </strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            <div className="modal-footer">
              <Button variant="secondary" onClick={closeResult}>
                Close
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
