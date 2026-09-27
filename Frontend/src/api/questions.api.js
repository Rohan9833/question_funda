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
