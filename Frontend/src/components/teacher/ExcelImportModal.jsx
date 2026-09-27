import { useRef, useState } from "react";
import { FileSpreadsheet, ChevronRight, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { questionsApi } from "../../api/questions.api";
import { useData } from "../../context/DataContext";

const fields = [
  "Sr No", "Question", "Option A", "Option B", "Option C", "Option D",
  "Correct Answer", "Subject", "Chapter", "Difficulty",
];

const requiredFields = [
  "Question", "Option A", "Option B", "Option C", "Option D",
  "Correct Answer", "Subject", "Chapter",
];

const norm = (value) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const aliases = {
  "Sr No": ["srno", "sno", "serialno", "serialnumber", "qno", "questionno"],
  Question: ["question", "questiontext", "questions"],
  "Option A": ["optiona", "a", "option1", "choicea"],
  "Option B": ["optionb", "b", "option2", "choiceb"],
  "Option C": ["optionc", "c", "option3", "choicec"],
  "Option D": ["optiond", "d", "option4", "choiced"],
  "Correct Answer": ["correctanswer", "correctoption", "answer", "ans", "correctionoption", "correctionoptions"],
  Subject: ["subject", "subjectname"],
  Chapter: ["chapter", "chaptername"],
  Difficulty: ["difficulty", "level"],
};

const autoMap = (field, headers) => {
  const normalizedHeaders = headers.map((header) => ({ original: header, normalized: norm(header) }));
  const exact = normalizedHeaders.find(({ normalized }) => normalized === norm(field));
  if (exact) return exact.original;

  const aliasMatch = normalizedHeaders.find(({ normalized }) =>
    (aliases[field] || []).includes(normalized)
  );

  return aliasMatch?.original || "Ignore";
};

export default function ExcelImportModal({ onClose }) {
  const { refreshQuestions } = useData();
  const input = useRef();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const readFile = async (selectedFile) => {
    setError("");
    setValidation(null);

    if (!selectedFile) return;

    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setError("Please select an .xlsx or .xls file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Excel file must be smaller than 10 MB.");
      return;
    }

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) throw new Error("The Excel file does not contain a worksheet.");

      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!json.length) throw new Error("The selected Excel sheet is empty.");

      const excelHeaders = Object.keys(json[0]);
      const auto = {};
      fields.forEach((field) => { auto[field] = autoMap(field, excelHeaders); });

      setFile(selectedFile);
      setRows(json);
      setHeaders(excelHeaders);
      setMapping(auto);
      setStep(2);
    } catch (err) {
      setFile(null);
      setError(err.message || "Could not read the Excel file.");
    }
  };

  const validate = async () => {
    setError("");

    const missing = requiredFields.filter(
      (field) => !mapping[field] || mapping[field] === "Ignore"
    );

    if (missing.length) {
      setError("Please map: " + missing.join(", "));
      return;
    }

    try {
      setLoading(true);
      const response = await questionsApi.validateImport({ rows, mapping });
      setValidation(response.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not validate the Excel data.");
    } finally {
      setLoading(false);
    }
  };

  const doImport = async () => {
    setError("");

    try {
      setLoading(true);
      await questionsApi.confirmImport({
        fileName: file?.name || "questions.xlsx",
        rows,
        mapping,
      });
      await refreshQuestions();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not import the questions.");
    } finally {
      setLoading(false);
    }
  };

  const title = step === 1 ? "Import question bank" : step === 2 ? "Map Excel columns" : "Review import";

  return (
    <Modal title={title} onClose={loading ? undefined : onClose}>
      {step === 1 && (
        <>
          <div className="dropzone" onClick={() => input.current?.click()}>
            <FileSpreadsheet size={30} />
            <h3>{file?.name || "Choose Excel file"}</h3>
            <p>.xlsx / .xls · maximum 10 MB</p>
            <input
              ref={input}
              hidden
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={(event) => { event.stopPropagation(); input.current?.click(); }}
            >
              <UploadCloud /> Choose file
            </Button>
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="modal-footer">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mapping-list">
            <p className="mapping-help">
              {rows.length} rows found. Match every Question Funda field to your Excel column.
            </p>

            {fields.map((field) => (
              <div className="mapping-row" key={field}>
                <span>{field}{requiredFields.includes(field) && " *"}</span>
                <ChevronRight />
                <select
                  value={mapping[field] || "Ignore"}
                  onChange={(event) =>
                    setMapping((current) => ({ ...current, [field]: event.target.value }))
                  }
                >
                  <option value="Ignore">Ignore</option>
                  {headers.map((header) => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
            ))}
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>Back</Button>
            <Button onClick={validate} disabled={loading}>
              {loading ? "Validating..." : "Validate & preview"}
            </Button>
          </div>
        </>
      )}

      {step === 3 && validation && (
        <>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="mapping-help">
              <strong>{validation.totalRows}</strong> total rows ·{" "}
              <strong>{validation.validRows}</strong> valid ·{" "}
              <strong>{validation.invalidRows}</strong> invalid
            </div>
          </div>

          {validation.invalidRows > 0 ? (
            <div className="mapping-list">
              {validation.errors.slice(0, 20).map((item, index) => (
                <div className="mapping-row" key={String(item.row) + "-" + index}>
                  <AlertCircle size={18} />
                  <span>{item.row ? "Row " + item.row + ": " : ""}{item.message}</span>
                </div>
              ))}
              {validation.errors.length > 20 && <p className="mapping-help">Showing the first 20 errors.</p>}
            </div>
          ) : (
            <div className="mapping-list">
              <div className="mapping-row">
                <CheckCircle2 size={18} />
                <span>All rows passed validation.</span>
              </div>
              <p className="mapping-help">
                Existing matching questions will be updated. Missing subjects and chapters will be created automatically.
              </p>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setStep(2)} disabled={loading}>Back</Button>
            <Button onClick={doImport} disabled={loading || validation.invalidRows > 0}>
              {loading ? "Importing..." : "Import " + validation.validRows + " questions"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
