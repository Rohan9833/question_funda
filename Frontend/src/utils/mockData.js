export const questions = [
  {
    id: 1,
    text: "Which organelle is known as the powerhouse of the cell?",
    subject: "Biology",
    chapter: "Cell",
    difficulty: "Easy",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
    answer: 1,
  },
  {
    id: 2,
    text: "The SI unit of electric current is:",
    subject: "Physics",
    chapter: "Current Electricity",
    difficulty: "Easy",
    options: ["Volt", "Watt", "Ampere", "Ohm"],
    answer: 2,
  },
  {
    id: 3,
    text: "Which bond holds the two strands of DNA together?",
    subject: "Biology",
    chapter: "Genetics",
    difficulty: "Medium",
    options: ["Ionic", "Peptide", "Hydrogen", "Ester"],
    answer: 2,
  },
];
export const papers = [
  {
    id: "p1",
    name: "NEET Biology — Full Mock 01",
    questions: 180,
    duration: 180,
    status: "Published",
    modes: ["Online", "Paper"],
  },
  {
    id: "p2",
    name: "Physics — Mechanics Test",
    questions: 45,
    duration: 60,
    status: "Published",
    modes: ["Online"],
  },
  {
    id: "p3",
    name: "Chemistry — Organic Basics",
    questions: 60,
    duration: 75,
    status: "Draft",
    modes: ["Paper"],
  },
];
export const exams = papers.map((p, i) => ({
  ...p,
  examId: "exam-" + (i + 1),
  students: 42 + i * 18,
  marks: p.questions * 4,
}));
