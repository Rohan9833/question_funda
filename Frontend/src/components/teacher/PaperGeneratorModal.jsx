import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useData } from "../../context/DataContext";

export default function PaperGeneratorModal({ onClose }) {
  const { questions, addPaper } = useData();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(
      questions.map((question) => question.subject).filter(Boolean)
    );

    return Array.from(uniqueSubjects).sort();
  }, [questions]);

  const [cfg, setCfg] = useState({
    name: "NEET Biology — Practice Test 05",
    subject: "",
    chapters: [],
    count: 50,
    duration: 60,
  });

  const getChaptersForSubject = (subject) => {
    if (!subject || subject === "Mixed") return [];

    const uniqueChapters = new Set(
      questions
        .filter((question) => question.subject === subject)
        .map((question) => question.chapter)
        .filter(Boolean)
    );

    return Array.from(uniqueChapters).sort();
  };

  const chapters = useMemo(
    () => getChaptersForSubject(cfg.subject),
    [questions, cfg.subject]
  );

  useEffect(() => {
    if (!subjects.length) return;

    const currentSubjectExists =
      cfg.subject === "Mixed" || subjects.includes(cfg.subject);

    if (!currentSubjectExists) {
      const firstSubject = subjects[0];

      setCfg((current) => ({
        ...current,
        subject: firstSubject,
        chapters: getChaptersForSubject(firstSubject),
      }));
    }
  }, [subjects, cfg.subject, questions]);

  const change = (event) => {
    const { name, value } = event.target;

    setError("");

    if (name === "subject") {
      setCfg((current) => ({
        ...current,
        subject: value,
        chapters: getChaptersForSubject(value),
      }));
      return;
    }

    setCfg((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleChapter = (chapter) => {
    setError("");

    setCfg((current) => ({
      ...current,
      chapters: current.chapters.includes(chapter)
        ? current.chapters.filter((item) => item !== chapter)
        : [...current.chapters, chapter],
    }));
  };

  const generate = async () => {
    setError("");
    setSaving(true);

    try {
      await addPaper(cfg);
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Could not generate the question paper."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Generate question paper" onClose={saving ? undefined : onClose}>
      <div className="form-grid">
        <label>
          Paper name
          <input
            name="name"
            value={cfg.name}
            onChange={change}
            disabled={saving}
          />
        </label>

        <label>
          Subject
          <select
            name="subject"
            value={cfg.subject}
            onChange={change}
            disabled={saving}
          >
            {!subjects.length && <option value="">No subjects available</option>}
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
            <option value="Mixed">Mixed</option>
          </select>
        </label>

        <label>
          Questions
          <input
            name="count"
            type="number"
            min="1"
            value={cfg.count}
            onChange={change}
            disabled={saving}
          />
        </label>

        <label>
          Duration
          <input
            name="duration"
            type="number"
            min="1"
            value={cfg.duration}
            onChange={change}
            disabled={saving}
          />
        </label>
      </div>

      {cfg.subject !== "Mixed" && (
        <div className="check-grid">
          {chapters.length ? (
            chapters.map((chapter) => (
              <label key={chapter}>
                <input
                  type="checkbox"
                  checked={cfg.chapters.includes(chapter)}
                  onChange={() => toggleChapter(chapter)}
                  disabled={saving}
                />
                {chapter}
              </label>
            ))
          ) : (
            <span>
              No chapters are available for this subject in the question bank.
            </span>
          )}
        </div>
      )}

      {cfg.subject !== "Mixed" && chapters.length > 0 && (
        <div>
          {cfg.chapters.length} of {chapters.length} chapters selected
        </div>
      )}

      {error && (
        <div role="alert">
          {error}
        </div>
      )}

      <div className="modal-footer">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={generate} disabled={saving || !cfg.subject}>
          {saving ? "Generating..." : "Generate paper"}
        </Button>
      </div>
    </Modal>
  );
}
