import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { examsApi } from "../../api/questions.api";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  X,
  Trophy,
  CircleCheck,
  CircleX,
  CircleMinus,
} from "lucide-react";
import { useData } from "../../context/DataContext";

const statusMeta = {
  correct: { label: "Correct", className: "result-question correct", Icon: CheckCircle2 },
  wrong: { label: "Wrong", className: "result-question wrong", Icon: XCircle },
  missed: { label: "Missed", className: "result-question missed", Icon: MinusCircle },
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

  const counts = detail
    ? detail.questions.reduce(
        (acc, question) => {
          acc[question.status] += 1;
          return acc;
        },
        { correct: 0, wrong: 0, missed: 0 }
      )
    : { correct: 0, wrong: 0, missed: 0 };

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
              <div className="result-card-top">
                <span className="pill">Completed</span>
                <span className="result-open-icon">↗</span>
              </div>
              <h3>{result.name}</h3>
              <div className="result-score-row">
                <strong>{result.score}/{result.total}</strong>
                <span>{result.percent}%</span>
              </div>
              <span className="result-view-link">View answer review</span>
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
        <div className="modal-backdrop result-backdrop" onClick={closeResult}>
          <section className="modal result-review-modal" onClick={(event) => event.stopPropagation()}>
            <div className="result-review-header">
              <div className="result-review-title">
                <div className="result-review-icon"><Trophy size={19} /></div>
                <div>
                  <div className="result-review-eyebrow">Answer Review</div>
                  <h2>{detail?.name || selectedResult.name}</h2>
                  <p>
                    {detail
                      ? "Review every answer from this attempt."
                      : "Loading your submitted answers..."}
                  </p>
                </div>
              </div>

              <button className="result-close-btn" type="button" onClick={closeResult} aria-label="Close result review">
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div className="result-review-loading">
                <div className="result-loading-spinner" />
                <strong>Loading answer review</strong>
                <span>Fetching your submitted answers...</span>
              </div>
            ) : error ? (
              <div className="result-review-error">
                <XCircle size={22} />
                <strong>Unable to load this result</strong>
                <span>{error}</span>
              </div>
            ) : detail ? (
              <>
                <div className="result-summary">
                  <div className="result-summary-score">
                    <span>Score</span>
                    <strong>{detail.score}<small>/{detail.total}</small></strong>
                    <em>{detail.percent}% overall</em>
                  </div>

                  <div className="result-summary-stat correct">
                    <CircleCheck size={17} />
                    <div><strong>{counts.correct}</strong><span>Correct</span></div>
                  </div>

                  <div className="result-summary-stat wrong">
                    <CircleX size={17} />
                    <div><strong>{counts.wrong}</strong><span>Wrong</span></div>
                  </div>

                  <div className="result-summary-stat missed">
                    <CircleMinus size={17} />
                    <div><strong>{counts.missed}</strong><span>Missed</span></div>
                  </div>
                </div>

                <div className="result-review-label">
                  <div>
                    <strong>Question review</strong>
                    <span>{detail.questions.length} questions</span>
                  </div>
                  <div className="result-legend">
                    <span><i className="legend-correct" /> Correct</span>
                    <span><i className="legend-wrong" /> Wrong</span>
                    <span><i className="legend-missed" /> Missed</span>
                  </div>
                </div>

                <div className="result-review-list">
                  {detail.questions.map((question) => {
                    const meta = statusMeta[question.status] || statusMeta.missed;
                    const Icon = meta.Icon;

                    return (
                      <article className={meta.className} key={question.questionId}>
                        <div className="result-question-head">
                          <div className="result-question-title">
                            <span className="result-question-number">Q{question.number}</span>
                            <strong>{question.text}</strong>
                          </div>
                          <span className="result-question-status">
                            <Icon size={15} />
                            {meta.label}
                          </span>
                        </div>

                        <div className="result-answer-summary">
                          <div className={question.selectedAnswer == null ? "answer-box unanswered" : "answer-box"}>
                            <span>Your answer</span>
                            <strong>
                              {question.selectedAnswer == null
                                ? "Not answered"
                                : String.fromCharCode(65 + question.selectedAnswer) +
                                  ". " + question.options[question.selectedAnswer]}
                            </strong>
                          </div>

                          <div className="answer-box correct-answer">
                            <span>Correct answer</span>
                            <strong>
                              {String.fromCharCode(65 + question.correctAnswer) +
                                ". " + question.options[question.correctAnswer]}
                            </strong>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : null}

            <div className="result-review-footer">
              <Button variant="secondary" onClick={closeResult}>Close review</Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
