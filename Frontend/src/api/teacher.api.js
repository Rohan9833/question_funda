import client from "./client";

export const teacherApi = {
  dashboard: () => client.get("/teacher/dashboard"),
  analytics: () => client.get("/teacher/analytics"),
};
