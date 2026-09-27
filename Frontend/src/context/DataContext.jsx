import { createContext, useContext, useEffect, useState } from "react";
import {
  questions as seedQuestions,
  papers as seedPapers,
  exams as seedExams,
} from "../utils/mockData";
import { questionPapersApi, questionsApi } from "../api/questions.api";
import { useAuth } from "./AuthContext";

const C = createContext(null);

const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const mapQuestion = (question) => ({
  id: question._id,
  text: question.text,
  options: (question.options || []).map((option) => option.text),
  answer: Math.max(
    0,
    ["A", "B", "C", "D"].indexOf(question.correctAnswer)
  ),
  subject: question.subjectId?.name || "General",
  chapter: question.chapterId?.name || "General",
  difficulty: question.difficulty || "Medium",
});

const mapPaper = (paper) => ({
  id: paper._id,
  name: paper.name,
  questions: Number(paper.questions) || 0,
  duration: Number(paper.duration) || 60,
  status: paper.status || "Draft",
  modes: paper.modes || ["Online", "Paper"],
  questionIds: paper.questionIds || [],
  subject: paper.subject || "Mixed",
});

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [questions, setQuestions] = useState(() =>
    read("qf_questions", seedQuestions)
  );
  const [papers, setPapers] = useState(() =>
    read("qf_papers", seedPapers)
  );
  const [exams, setExams] = useState(() =>
    read("qf_exams", seedExams)
  );
  const [results, setResults] = useState(() =>
    read("qf_results", [])
  );

  const refreshQuestions = async () => {
    try {
      const response = await questionsApi.list();
      const serverQuestions = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const mapped = serverQuestions.map(mapQuestion);
      setQuestions(mapped);
      return mapped;
    } catch (error) {
      console.warn("Could not load questions from API:", error.message);
      return questions;
    }
  };

  const refreshPapers = async () => {
    try {
      const response = await questionPapersApi.list();
      const serverPapers = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const mapped = serverPapers.map(mapPaper);
      setPapers(mapped);
      return mapped;
    } catch (error) {
      console.warn("Could not load question papers from API:", error.message);
      return papers;
    }
  };

  useEffect(() => {
    if (user?.role === "teacher") {
      refreshQuestions();
      refreshPapers();
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    localStorage.setItem("qf_questions", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("qf_papers", JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem("qf_exams", JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem("qf_results", JSON.stringify(results));
  }, [results]);

  const addQuestions = (items) =>
    setQuestions((current) => [
      ...current,
      ...items.map((item, index) => ({
        ...item,
        id: Date.now() + index,
      })),
    ]);

  const addPaper = async (cfg) => {
    const response = await questionPapersApi.create({
      name: cfg.name,
      subject: cfg.subject,
      chapters: cfg.chapters || [],
      count: Number(cfg.count),
      duration: Number(cfg.duration),
    });

    const createdPaper = mapPaper(response.data.data);

    setPapers((current) => [createdPaper, ...current]);

    setExams((current) => [
      {
        ...createdPaper,
        examId: "exam-" + Date.now(),
        students: 0,
        marks: createdPaper.questions * 4,
      },
      ...current,
    ]);

    return createdPaper;
  };

  const addResult = (result) =>
    setResults((current) => [result, ...current]);

  const resetData = () => {
    setQuestions(seedQuestions);
    setPapers(seedPapers);
    setExams(seedExams);
    setResults([]);
  };

  return (
    <C.Provider
      value={{
        questions,
        papers,
        exams,
        results,
        addQuestions,
        refreshQuestions,
        refreshPapers,
        addPaper,
        addResult,
        resetData,
      }}
    >
      {children}
    </C.Provider>
  );
}

export const useData = () => useContext(C);
