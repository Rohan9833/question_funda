import { createContext, useContext, useEffect, useState } from "react";
import { questions as seedQuestions, papers as seedPapers, exams as seedExams } from "../utils/mockData";
import { questionsApi } from "../api/questions.api";
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

  useEffect(() => {
    if (user?.role === "teacher") {
      refreshQuestions();
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

  const addPaper = (cfg) => {
    const id = "p-" + Date.now();
    const selected = questions
      .filter((q) => cfg.subject === "Mixed" || q.subject === cfg.subject)
      .slice(0, Number(cfg.count) || 10);

    const paper = {
      id,
      name: cfg.name,
      questions: selected.length,
      duration: Number(cfg.duration) || 60,
      status: "Draft",
      modes: ["Online", "Paper"],
      questionIds: selected.map((q) => q.id),
      subject: cfg.subject,
    };

    setPapers((current) => [paper, ...current]);
    setExams((current) => [
      {
        ...paper,
        examId: "exam-" + Date.now(),
        students: 0,
        marks: selected.length * 4,
      },
      ...current,
    ]);

    return paper;
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
