import request from "supertest";
import { app } from "../src/app.js";
describe("Health endpoint", () => {
  it("should return ok message", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "ok" });
  });
});
