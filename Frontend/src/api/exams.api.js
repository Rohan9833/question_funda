import client from "./client";
export const examsApi = {
  list: () => client.get("/exams"),
  get: (id) => client.get("/exams/" + id),
  performance: (id) => client.get("/exams/" + id + "/performance"),
  attemptDetail: (examId, attemptId) => client.get("/exams/" + examId + "/attempts/" + attemptId),
  updateStatus: (id, status) => client.patch("/exams/" + id + "/status", { status }),
  submit: (id, d) => client.post("/exams/" + id + "/submit", d),
};
