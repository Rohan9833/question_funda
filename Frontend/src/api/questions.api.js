import client from "./client";

export const questionsApi = {
  list: (params) => client.get("/questions", { params }),
  validateImport: (payload) => client.post("/questions/import/validate", payload),
  confirmImport: (payload) => client.post("/questions/import/confirm", payload),
  importHistory: () => client.get("/questions/imports/history"),
  create: (data) => client.post("/questions", data),
};

export const questionPapersApi = {
  list: () => client.get("/question-papers"),
  create: (data) => client.post("/question-papers", data),
};

export const examsApi = {
  list: () => client.get("/exams"),
  create: (data) => client.post("/exams", data),
  get: (id) => client.get(`/exams/${id}`),
  submit: (id, data) => client.post(`/exams/${id}/submit`, data),
  results: () => client.get("/exams/results/me"),
  resultDetail: (id) => client.get(`/exams/results/${id}`),
};
