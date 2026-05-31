import { Hono } from "hono";
import { z } from "zod";
import postgres from "postgres";
import { authMiddleware } from "../middleware/auth.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const sql = postgres(DATABASE_URL);

const correctiveActionsRouter = new Hono();
correctiveActionsRouter.use("*", authMiddleware);

const createSchema = z.object({
  reportId: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  standard: z.string().min(1),
  requirement: z.string().min(1),
  severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["open", "in_progress", "resolved", "verified", "closed"]).optional(),
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
  assignedTo: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  evidence: z.string().nullable().optional(),
  verifiedBy: z.string().nullable().optional(),
});

// GET /api/corrective-actions — list all for org
correctiveActionsRouter.get("/corrective-actions", async (c) => {
  const orgId = c.get("orgId") as string;
  const status = c.req.query("status");
  const severity = c.req.query("severity");
  const reportId = c.req.query("reportId");

  let query = `SELECT * FROM corrective_actions WHERE org_id = $1`;
  const params: (string | number | null)[] = [orgId];
  let paramIndex = 2;

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (severity) {
    query += ` AND severity = $${paramIndex}`;
    params.push(severity);
    paramIndex++;
  }

  if (reportId) {
    query += ` AND report_id = $${paramIndex}`;
    params.push(reportId);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  const results = await sql.unsafe(query, params);
  return c.json({ correctiveActions: results });
});

// GET /api/corrective-actions/summary — counts by status and severity
correctiveActionsRouter.get("/corrective-actions/summary", async (c) => {
  const orgId = c.get("orgId") as string;

  const byStatus = await sql`
    SELECT status, COUNT(*)::int as count
    FROM corrective_actions
    WHERE org_id = ${orgId}
    GROUP BY status
  `;

  const bySeverity = await sql`
    SELECT severity, COUNT(*)::int as count
    FROM corrective_actions
    WHERE org_id = ${orgId}
    GROUP BY severity
  `;

  const overdue = await sql`
    SELECT COUNT(*)::int as count
    FROM corrective_actions
    WHERE org_id = ${orgId}
      AND status IN ('open', 'in_progress')
      AND due_date < NOW()
  `;

  const total = await sql`
    SELECT COUNT(*)::int as count
    FROM corrective_actions
    WHERE org_id = ${orgId}
  `;

  return c.json({
    summary: {
      total: total[0]?.count ?? 0,
      overdue: overdue[0]?.count ?? 0,
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
      bySeverity: Object.fromEntries(bySeverity.map((r) => [r.severity, r.count])),
    },
  });
});

// POST /api/corrective-actions — create new action
correctiveActionsRouter.post("/corrective-actions", async (c) => {
  const orgId = c.get("orgId") as string;
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { reportId, title, description, standard, requirement, severity, assignedTo, dueDate } = parsed.data;

  const result = await sql`
    INSERT INTO corrective_actions (org_id, report_id, title, description, standard, requirement, severity, assigned_to, due_date)
    VALUES (
      ${orgId},
      ${reportId ?? null},
      ${title},
      ${description},
      ${standard},
      ${requirement},
      ${severity},
      ${assignedTo ?? null},
      ${dueDate ? new Date(dueDate) : null}
    )
    RETURNING *
  `;

  return c.json({ correctiveAction: result[0] }, 201);
});

// PATCH /api/corrective-actions/:id — update action
correctiveActionsRouter.patch("/corrective-actions/:id", async (c) => {
  const orgId = c.get("orgId") as string;
  const actionId = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  // Verify the action belongs to the org
  const existing = await sql`
    SELECT id FROM corrective_actions WHERE id = ${actionId} AND org_id = ${orgId}
  `;

  if (existing.length === 0) {
    return c.json({ error: "Corrective action not found" }, 404);
  }

  const updates = parsed.data;
  const setClauses: string[] = [];
  const values: (string | number | Date | null)[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    setClauses.push(`title = $${paramIndex}`);
    values.push(updates.title);
    paramIndex++;
  }

  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex}`);
    values.push(updates.description);
    paramIndex++;
  }

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;

    // Auto-set verified_at when status changes to verified
    if (updates.status === "verified") {
      setClauses.push(`verified_at = NOW()`);
    }
  }

  if (updates.severity !== undefined) {
    setClauses.push(`severity = $${paramIndex}`);
    values.push(updates.severity);
    paramIndex++;
  }

  if (updates.assignedTo !== undefined) {
    setClauses.push(`assigned_to = $${paramIndex}`);
    values.push(updates.assignedTo);
    paramIndex++;
  }

  if (updates.dueDate !== undefined) {
    setClauses.push(`due_date = $${paramIndex}`);
    values.push(updates.dueDate ? new Date(updates.dueDate) : null);
    paramIndex++;
  }

  if (updates.evidence !== undefined) {
    setClauses.push(`evidence = $${paramIndex}`);
    values.push(updates.evidence);
    paramIndex++;
  }

  if (updates.verifiedBy !== undefined) {
    setClauses.push(`verified_by = $${paramIndex}`);
    values.push(updates.verifiedBy);
    paramIndex++;
  }

  setClauses.push("updated_at = NOW()");

  if (setClauses.length === 1) {
    return c.json({ error: "No valid fields to update" }, 400);
  }

  values.push(actionId);
  values.push(orgId);

  const query = `
    UPDATE corrective_actions
    SET ${setClauses.join(", ")}
    WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
    RETURNING *
  `;

  const result = await sql.unsafe(query, values);
  return c.json({ correctiveAction: result[0] });
});

export { correctiveActionsRouter };
