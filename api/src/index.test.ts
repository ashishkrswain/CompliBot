import { expect, test, describe } from "bun:test";
import { app } from "./index";

describe("Health Check", () => {
  test("GET /health returns 200 and status ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: "ok",
      service: "complibot-api",
      timestamp: expect.any(String),
    });
  });
});
