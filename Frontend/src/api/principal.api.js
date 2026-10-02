import client from "./client";

const unwrap = (response) => response.data;

export const principalApi = {
  overview: () => client.get("/principal/overview"),
  teachers: (params = {}) => client.get("/principal/teachers", { params }),
  students: (params = {}) => client.get("/principal/students", { params }),
  exams: (params = {}) => client.get("/principal/exams", { params }),
  papers: (params = {}) => client.get("/principal/papers", { params }),
  questions: (params = {}) => client.get("/principal/questions", { params }),
  analytics: () => client.get("/principal/analytics"),
  setUserStatus: (id, isActive) => client.patch(`/principal/users/${id}/status`, { isActive }),
};

export { unwrap };