import client from "./client";

export const studentsApi = {
  list: (params = {}) => client.get("/students/teacher", { params }),
  dashboard: () => client.get("/students/dashboard"),
};
