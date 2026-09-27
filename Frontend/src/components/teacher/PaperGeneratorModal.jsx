import { useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useData } from "../../context/DataContext";

export default function PaperGeneratorModal({ onClose }) {
  const { questions, addPaper } = useData();

  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(
      questions.map((question) => question.subject).filter(Boolean)
    );

    return Array.from(uniqueSubjects).sort();
  }, [questions]);

  const [cfg, setCfg] = useState(() => ({
    name: "NEET Biology — Practice Test 05",
    subject: subjects[0] || "",
    chapters: [],
    count: 50,
    duration: 60,
  }));

  const chapters = useMemo(() => {
    if (!cfg.subject || cfg.subject === "Mixed") return [];

    const uniqueChapters = new Set(
      questions
        .filter((question) => question.subject === cfg.subject)
        .map((question) => question.chapter)
        .filter(Boolean)
    );

    return Array.from(uniqueChapters).sort();
  }, [questions, cfg.subject]);

  const change = (event) => {
    const { name, value } = event.target;

    if (name === "subject") {
      setCfg((current) => ({
        ...current,
        subject: value,
        chapters: [],
      }));
      return;
    }

    setCfg((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleChapter = (chapter) => {
    setCfg((current) => ({
      ...current,
      chapters: current.chapters.includes(chapter)
        ? current.chapters.filter((item) => item !== chapter)
        : [...current.chapters, chapter],
    }));
  };

  const generate = () => {
    addPaper(cfg);
    onClose();
  };

  return (
    <Modal title="Generate question paper" onClose={onClose}>
      <div className="form-grid">
        <label>
          Paper name
          <input name="name" value={cfg.name} onChange={change} />
        </label>

        <label>
          Subject
          <select name="subject" value={cfg.subject} onChange={change}>
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

      <div className="modal-footer">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={generate}>Generate paper</Button>
      </div>
    </Modal>
  );
}
