import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRouter } from "./routes/auth.js";
import { orgRouter } from "./routes/org.js";
import { projectsRouter } from "./routes/projects.js";
import { documentsRouter } from "./routes/documents.js";
import { reportsRouter } from "./routes/reports.js";
import { complianceRouter } from "./routes/compliance.js";
import { analyticsRouter } from "./routes/analytics.js";
import { exportRouter } from "./routes/export.js";
import { correctiveActionsRouter } from "./routes/corrective-actions.js";
import { rateLimitMiddleware } from "./middleware/rate-limit.js";

const app = new Hono();

// Global middleware
app.use("*", cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3005"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use("*", logger());
app.use("/api/*", rateLimitMiddleware());

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", service: "complibot-api", timestamp: new Date().toISOString() });
});

// Routes
app.route("/api/auth", authRouter);
app.route("/api/org", orgRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/documents", documentsRouter);
app.route("/api/reports", reportsRouter);
app.route("/api/compliance", complianceRouter);
app.route("/api/analytics", analyticsRouter);
app.route("/api", exportRouter);
app.route("/api", correctiveActionsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = Number(process.env["API_PORT"] ?? 3001);

console.log(`CompliBot API starting on port ${port}`);

export { app };
export default {
  port,
  fetch: app.fetch,
};
