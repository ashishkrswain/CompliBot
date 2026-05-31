import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middleware/auth.js";
import * as schema from "../db/schema.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const client = postgres(DATABASE_URL);
const db = drizzle(client);

const orgRouter = new Hono();
orgRouter.use("*", authMiddleware);

const updateOrgSchema = z.object({
  name: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  locations: z.number().int().positive().optional(),
});

const addFacilitySchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  facilityType: z.string().optional(),
  employeeCount: z.number().int().positive().optional(),
  naicsCode: z.string().optional(),
});

orgRouter.get("/", async (c) => {
  const orgId = c.get("orgId") as string;

  const orgs = await db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId)).limit(1);
  const org = orgs[0];

  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }

  const facilities = await db.select().from(schema.facilities).where(eq(schema.facilities.orgId, orgId));

  return c.json({ organization: org, facilities });
});

orgRouter.put("/", async (c) => {
  const orgId = c.get("orgId") as string;
  const body = await c.req.json();
  const parsed = updateOrgSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name) updates["name"] = parsed.data.name;
  if (parsed.data.industry) updates["industry"] = parsed.data.industry;
  if (parsed.data.size) updates["size"] = parsed.data.size;
  if (parsed.data.locations) updates["locations"] = parsed.data.locations;

  await db.update(schema.organizations).set(updates).where(eq(schema.organizations.id, orgId));

  const updated = await db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId)).limit(1);
  return c.json({ organization: updated[0] });
});

orgRouter.post("/facilities", async (c) => {
  const orgId = c.get("orgId") as string;
  const body = await c.req.json();
  const parsed = addFacilitySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const facilityId = uuidv4();
  await db.insert(schema.facilities).values({
    id: facilityId,
    orgId,
    name: parsed.data.name,
    address: parsed.data.address ?? null,
    city: parsed.data.city ?? null,
    state: parsed.data.state ?? null,
    zip: parsed.data.zip ?? null,
    facilityType: parsed.data.facilityType ?? null,
    employeeCount: parsed.data.employeeCount ?? null,
    naicsCode: parsed.data.naicsCode ?? null,
  });

  const facility = await db.select().from(schema.facilities).where(eq(schema.facilities.id, facilityId)).limit(1);
  return c.json({ facility: facility[0] }, 201);
});

export { orgRouter };
