import client from "./client";
export const papersApi = {
  list: () => client.get("/question-papers"),
  create: (d) => client.post("/question-papers", d),
  get: (id) => client.get("/question-papers/" + id),
  performance: (id) => client.get("/question-papers/" + id + "/performance"),
  updateStatus: (id, status) => client.patch("/question-papers/" + id + "/status", { status }),
};
