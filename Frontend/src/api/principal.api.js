import client from "./client";

const unwrap = (response) => response.data;

export const principalApi = {
  overview: () => client.get("/principal/overview"),
  teachers: (params = {}) => client.get("/principal/teachers", { params }),
  students: (params = {}) => client.get("/principal/students", { params }),
  exams: (params = {}) => client.get("/principal/exams", { params }),
  examPerformance: (id) => client.get("/exams/" + id + "/performance"),
  examAttemptDetail: (examId, attemptId) => client.get("/exams/" + examId + "/attempts/" + attemptId),
  updateExamStatus: (id, status) => client.patch("/exams/" + id + "/status", { status }),
  papers: (params = {}) => client.get("/principal/papers", { params }),
  paperDetail: (id) => client.get("/question-papers/" + id),

  questions: (params = {}) => client.get("/principal/questions", { params }),
  analytics: () => client.get("/principal/analytics"),
  setUserStatus: (id, isActive) => client.patch(`/principal/users/${id}/status`, { isActive }),
};

export { unwrap };