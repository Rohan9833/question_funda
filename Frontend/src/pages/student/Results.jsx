import PageHeader from "../../components/common/PageHeader";
import { useData } from "../../context/DataContext";

export default function Results() {
  const { results } = useData();

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
            <article className="result-card" key={result.id}>
              <span className="pill">Completed</span>
              <h3>{result.name}</h3>
              <strong>
                {result.score}/{result.total}
              </strong>
              <em>{result.percent}%</em>
            </article>
          ))
        ) : (
          <article className="result-card">
            <span className="pill">No attempts yet</span>
            <h3>Complete an exam to see your result here.</h3>
          </article>
        )}
      </div>
    </>
  );
}
