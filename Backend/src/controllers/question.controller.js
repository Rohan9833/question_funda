const mongoose = require("mongoose");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const QuestionImport = require("../models/QuestionImport");

const REQUIRED_FIELDS = [
  "Question",
  "Option A",
  "Option B",
  "Option C",
  "Option D",
  "Correct Answer",
  "Subject",
  "Chapter",
];

const IMPORT_FIELDS = [...REQUIRED_FIELDS, "Difficulty", "Sr No"];

const text = (value) => String(value ?? "").trim();

const normalizeName = (value) =>
  text(value).toLowerCase().replace(/\s+/g, " ");

const normalizeDifficulty = (value) => {
  const valueText = text(value).toLowerCase();
  if (valueText === "easy") return "Easy";
  if (valueText === "hard") return "Hard";
  return "Medium";
};

const normalizeAnswer = (value) => {
  const answer = text(value).toUpperCase();
  if (["A", "B", "C", "D"].includes(answer)) return answer;

  const numeric = Number(answer);
  if (numeric >= 1 && numeric <= 4) {
    return ["A", "B", "C", "D"][numeric - 1];
  }

  return null;
};

const getMappedValue = (row, mapping, field) => {
  const source = mapping[field];
  if (!source || source === "Ignore") return "";
  return row[source];
};

const validateMapping = (mapping = {}) => {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!mapping[field] || mapping[field] === "Ignore") {
      errors.push(`The "${field}" field must be mapped.`);
    }
  }

  return errors;
};

const transformRows = (rows = [], mapping = {}) => {
  const errors = [];
  const validRows = [];
  const seen = new Map();

  rows.forEach((row, index) => {
    const excelRow = index + 2;
    const question = text(getMappedValue(row, mapping, "Question"));
    const options = ["A", "B", "C", "D"].map((key) =>
      text(getMappedValue(row, mapping, `Option ${key}`))
    );
    const correctAnswer = normalizeAnswer(
      getMappedValue(row, mapping, "Correct Answer")
    );
    const subject = text(getMappedValue(row, mapping, "Subject"));
    const chapter = text(getMappedValue(row, mapping, "Chapter"));
    const difficulty = normalizeDifficulty(
      getMappedValue(row, mapping, "Difficulty")
    );
    const serialRaw = text(getMappedValue(row, mapping, "Sr No"));
    const serialNumber = serialRaw && Number.isFinite(Number(serialRaw))
      ? Number(serialRaw)
      : null;

    const rowErrors = [];

    if (!question) rowErrors.push("Question is empty.");
    options.forEach((option, optionIndex) => {
      if (!option) rowErrors.push(`Option ${["A", "B", "C", "D"][optionIndex]} is empty.`);
    });
    if (!correctAnswer) {
      rowErrors.push("Correct Answer must be A, B, C, D, or 1, 2, 3, 4.");
    }
    if (!subject) rowErrors.push("Subject is empty.");
    if (!chapter) rowErrors.push("Chapter is empty.");

    const duplicateKey = [
      normalizeName(question),
      normalizeName(subject),
      normalizeName(chapter),
    ].join("|");

    if (!rowErrors.length && seen.has(duplicateKey)) {
      rowErrors.push(`Duplicate of Excel row ${seen.get(duplicateKey)}.`);
    }

    if (rowErrors.length) {
      errors.push({
        row: excelRow,
        message: rowErrors.join(" "),
      });
      return;
    }

    seen.set(duplicateKey, excelRow);

    validRows.push({
      sourceRow: excelRow,
      serialNumber,
      text: question,
      options: ["A", "B", "C", "D"].map((key, optionIndex) => ({
        key,
        text: options[optionIndex],
      })),
      correctAnswer,
      subject,
      chapter,
      difficulty,
    });
  });

  return { validRows, errors };
};

const validatePayload = ({ rows, mapping }) => {
  if (!Array.isArray(rows) || !rows.length) {
    return { validRows: [], errors: [{ row: 0, message: "Excel contains no data rows." }] };
  }

  const mappingErrors = validateMapping(mapping);
  if (mappingErrors.length) {
    return {
      validRows: [],
      errors: mappingErrors.map((message) => ({ row: 0, message })),
    };
  }

  return transformRows(rows, mapping);
};

const validateImport = async (req, res, next) => {
  try {
    const { rows, mapping } = req.body;
    const result = validatePayload({ rows, mapping });

    return res.status(200).json({
      success: true,
      data: {
        totalRows: Array.isArray(rows) ? rows.length : 0,
        validRows: result.validRows.length,
        invalidRows: result.errors.length,
        errors: result.errors,
        preview: result.validRows.slice(0, 25),
        fields: IMPORT_FIELDS,
      },
    });
  } catch (error) {
    next(error);
  }
};

const confirmImport = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { fileName = "questions.xlsx", rows, mapping } = req.body;
    const result = validatePayload({ rows, mapping });

    if (result.errors.length) {
      return res.status(400).json({
        success: false,
        message: "Import contains validation errors.",
        data: {
          totalRows: Array.isArray(rows) ? rows.length : 0,
          validRows: result.validRows.length,
          invalidRows: result.errors.length,
          errors: result.errors,
        },
      });
    }

    const importRecord = new QuestionImport({
      fileName: text(fileName) || "questions.xlsx",
      mode: "update",
      status: "validated",
      mapping,
      totalRows: rows.length,
      validRows: result.validRows.length,
      createdBy: req.auth.sub,
    });

    let importedRows = 0;
    let updatedRows = 0;

    await session.withTransaction(async () => {
      for (const item of result.validRows) {
        const subject = await Subject.findOneAndUpdate(
          { normalizedName: normalizeName(item.subject) },
          {
            $setOnInsert: {
              name: item.subject,
              normalizedName: normalizeName(item.subject),
            },
          },
          { upsert: true, new: true, session }
        );

        const chapter = await Chapter.findOneAndUpdate(
          {
            subjectId: subject._id,
            normalizedName: normalizeName(item.chapter),
          },
          {
            $setOnInsert: {
              name: item.chapter,
              normalizedName: normalizeName(item.chapter),
              subjectId: subject._id,
            },
          },
          { upsert: true, new: true, session }
        );

        const existing = await Question.findOne({
          subjectId: subject._id,
          chapterId: chapter._id,
          text: item.text,
        }).session(session);

        await Question.findOneAndUpdate(
          {
            subjectId: subject._id,
            chapterId: chapter._id,
            text: item.text,
          },
          {
            $set: {
              serialNumber: item.serialNumber,
              options: item.options,
              correctAnswer: item.correctAnswer,
              difficulty: item.difficulty,
              sourceImportId: importRecord._id,
              createdBy: req.auth.sub,
            },
            $setOnInsert: {
              subjectId: subject._id,
              chapterId: chapter._id,
              text: item.text,
            },
          },
          {
            upsert: true,
            new: true,
            session,
            setDefaultsOnInsert: true,
          }
        );

        if (existing) updatedRows += 1;
        else importedRows += 1;
      }

      importRecord.status = "completed";
      importRecord.importedRows = importedRows;
      importRecord.updatedRows = updatedRows;
      importRecord.failedRows = 0;
      importRecord.completedAt = new Date();
      await importRecord.save({ session });
    });

    return res.status(201).json({
      success: true,
      message: "Questions imported successfully.",
      data: {
        importId: importRecord._id,
        totalRows: rows.length,
        importedRows,
        updatedRows,
        failedRows: 0,
      },
    });
  } catch (error) {
    try {
      await QuestionImport.updateOne(
        { _id: req.body?.importId },
        { $set: { status: "failed" } }
      );
    } catch (_) {
      // Preserve the original import error.
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

const listQuestions = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.chapterId) filter.chapterId = req.query.chapterId;

    const search = text(req.query.search);
    if (search) filter.text = { $regex: search, $options: "i" };

    const questions = await Question.find(filter)
      .populate("subjectId", "name")
      .populate("chapterId", "name")
      .sort({ serialNumber: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

const listImportHistory = async (req, res, next) => {
  try {
    const history = await QuestionImport.find({ createdBy: req.auth.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateImport,
  confirmImport,
  listQuestions,
  listImportHistory,
};
