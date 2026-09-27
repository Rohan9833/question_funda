import { useMemo, useState } from "react";
import { Search, UploadCloud, SlidersHorizontal } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import ExcelImportModal from "../../components/teacher/ExcelImportModal";
import { useData } from "../../context/DataContext";

export default function QuestionBank() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [showImport, setShowImport] = useState(false);
  const { questions } = useData();

  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(
      questions
        .map((question) => question.subject)
        .filter(Boolean)
    );

    return ["All Subjects", ...Array.from(uniqueSubjects).sort()];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const search = query.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSubject =
        subject === "All Subjects" || question.subject === subject;

      if (!matchesSubject) return false;
      if (!search) return true;

      return [
        question.text,
        question.subject,
        question.chapter,
        question.difficulty,
        ...(question.options || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [questions, query, subject]);

  return (
    <>
      <PageHeader
        eyebrow={filteredQuestions.length + " questions"}
        title="Question Bank"
        description="Centralized library for every future paper."
        actions={
          <Button onClick={() => setShowImport(true)}>
            <UploadCloud />
            Import Excel
          </Button>
        }
      />

      <div className="question-bank-filters">
        <div className="search">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions..."
          />
        </div>

        <div className="question-filter-select">
          <SlidersHorizontal />
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            aria-label="Filter questions by subject"
          >
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel">
        <div className="question-bank-summary">
          <span>
            Showing <strong>{filteredQuestions.length}</strong> of{" "}
            <strong>{questions.length}</strong> questions
          </span>

          {subject !== "All Subjects" && (
            <span className="question-bank-active-filter">
              Subject: {subject}
            </span>
          )}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Subject</th>
                <th>Chapter</th>
                <th>Difficulty</th>
              </tr>
            </thead>

            <tbody>
              {filteredQuestions.map((question, index) => (
                <tr key={question.id || index}>
                  <td>Q{index + 1}</td>

                  <td>
                    <strong>{question.text}</strong>
                    <span className="question-options">
                      {(question.options || []).join(" · ")}
                    </span>
                  </td>

                  <td>{question.subject || "—"}</td>
                  <td>{question.chapter || "—"}</td>
                  <td>{question.difficulty || "Medium"}</td>
                </tr>
              ))}

              {!filteredQuestions.length && (
                <tr>
                  <td colSpan="5">
                    <div className="question-bank-empty">
                      <strong>No questions found</strong>
                      <span>
                        Try changing the subject filter or search term.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <ExcelImportModal onClose={() => setShowImport(false)} />
      )}
    </>
  );
}
