import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middleware/auth.js";
import * as schema from "../db/schema.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const client = postgres(DATABASE_URL);
const db = drizzle(client);

const projectsRouter = new Hono();
projectsRouter.use("*", authMiddleware);

const createProjectSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["OSHA_300", "EPA_TIER2", "MAINTENANCE_AUDIT", "SAFETY_INSPECTION"]),
  facilityId: z.string().uuid().optional(),
  description: z.string().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  dueDate: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["draft", "in_progress", "review", "complete", "archived"]).optional(),
  description: z.string().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  dueDate: z.string().optional(),
});

projectsRouter.post("/", async (c) => {
  const orgId = c.get("orgId") as string;
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const projectId = uuidv4();
  await db.insert(schema.projects).values({
    id: projectId,
    orgId,
    name: parsed.data.name,
    type: parsed.data.type,
    facilityId: parsed.data.facilityId ?? null,
    description: parsed.data.description ?? null,
    dateRangeStart: parsed.data.dateRangeStart ? new Date(parsed.data.dateRangeStart) : null,
    dateRangeEnd: parsed.data.dateRangeEnd ? new Date(parsed.data.dateRangeEnd) : null,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    status: "draft",
  });

  const project = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1);
  return c.json({ project: project[0] }, 201);
});

projectsRouter.get("/", async (c) => {
  const orgId = c.get("orgId") as string;
  const projectsList = await db.select().from(schema.projects).where(eq(schema.projects.orgId, orgId));
  return c.json({ projects: projectsList });
});

projectsRouter.get("/:id", async (c) => {
  const orgId = c.get("orgId") as string;
  const projectId = c.req.param("id");

  const projectResults = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.orgId, orgId)))
    .limit(1);

  const project = projectResults[0];
  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  // Get related data
  const docs = await db.select().from(schema.documents).where(eq(schema.documents.projectId, projectId));
  const reportsList = await db.select().from(schema.reports).where(eq(schema.reports.projectId, projectId));
  const gaps = await db.select().from(schema.complianceGaps).where(eq(schema.complianceGaps.projectId, projectId));

  return c.json({ project, documents: docs, reports: reportsList, complianceGaps: gaps });
});

projectsRouter.put("/:id", async (c) => {
  const orgId = c.get("orgId") as string;
  const projectId = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const existing = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.orgId, orgId)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: "Project not found" }, 404);
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name) updates["name"] = parsed.data.name;
  if (parsed.data.status) updates["status"] = parsed.data.status;
  if (parsed.data.description) updates["description"] = parsed.data.description;
  if (parsed.data.dateRangeStart) updates["dateRangeStart"] = new Date(parsed.data.dateRangeStart);
  if (parsed.data.dateRangeEnd) updates["dateRangeEnd"] = new Date(parsed.data.dateRangeEnd);
  if (parsed.data.dueDate) updates["dueDate"] = new Date(parsed.data.dueDate);

  await db.update(schema.projects).set(updates).where(eq(schema.projects.id, projectId));

  const updated = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1);
  return c.json({ project: updated[0] });
});

export { projectsRouter };
