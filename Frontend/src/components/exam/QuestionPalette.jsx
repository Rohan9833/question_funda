export default function QuestionPalette({
  total,
  current,
  answers,
  questions = [],
  onSelect,
}) {
  return (
    <div className="palette">
      {Array.from({ length: total }, (_, i) => {
        const question = questions[i];
        const questionId = question?.id;
        const isAnswered =
          questionId != null && answers?.[questionId] != null;

        return (
          <button
            key={questionId ?? i}
            className={[
              isAnswered ? "done" : "",
              i === current ? "current" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(i)}
            aria-label={
              isAnswered
                ? `Question ${i + 1}, answered`
                : `Question ${i + 1}, unanswered`
            }
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
