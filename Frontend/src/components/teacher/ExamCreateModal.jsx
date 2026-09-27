import { useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useData } from "../../context/DataContext";

export default function ExamCreateModal({ onClose }) {
  const { papers, addExam } = useData();
  const [paperId, setPaperId] = useState(papers[0]?.id || "");
  const [modes, setModes] = useState(["Online"]);
  const [status, setStatus] = useState("Draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedPaper = useMemo(
    () => papers.find((paper) => paper.id === paperId),
    [papers, paperId]
  );

  const toggleMode = (mode) => {
    setModes((current) =>
      current.includes(mode)
        ? current.filter((item) => item !== mode)
        : [...current, mode]
    );
  };

  const create = async () => {
    if (!paperId) {
      setError("Select a question paper.");
      return;
    }

    if (!modes.length) {
      setError("Select at least one exam mode.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await addExam({
        questionPaperId: paperId,
        modes,
        status,
      });
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Could not create exam."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create exam" onClose={saving ? undefined : onClose}>
      <div className="form-grid">
        <label>
          Question paper
          <select
            value={paperId}
            onChange={(event) => setPaperId(event.target.value)}
            disabled={saving}
          >
            {!papers.length && <option value="">No papers available</option>}
            {papers.map((paper) => (
              <option key={paper.id} value={paper.id}>
                {paper.name} · {paper.questions} questions
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={saving}
          >
            <option value="Draft">Draft</option>
            <option value="Live">Live</option>
          </select>
        </label>
      </div>

      <div className="check-grid">
        <label>
          <input
            type="checkbox"
            checked={modes.includes("Online")}
            onChange={() => toggleMode("Online")}
            disabled={saving}
          />
          Online
        </label>
        <label>
          <input
            type="checkbox"
            checked={modes.includes("Paper")}
            onChange={() => toggleMode("Paper")}
            disabled={saving}
          />
          Paper
        </label>
      </div>

      {selectedPaper && (
        <p>
          {selectedPaper.questions} questions · {selectedPaper.duration} minutes
        </p>
      )}

      {error && <div role="alert">{error}</div>}

      <div className="modal-footer">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={create} disabled={saving || !paperId}>
          {saving ? "Creating..." : "Create exam"}
        </Button>
      </div>
    </Modal>
  );
}
