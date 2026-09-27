import client from "./client";
export const questionsApi = {
  list: (p) => client.get("/questions", { params: p }),
  upload: (f) =>
    client.post("/questions/import", f, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  create: (d) => client.post("/questions", d),
};
