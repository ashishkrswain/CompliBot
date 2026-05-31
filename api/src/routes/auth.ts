import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { signToken, hashPassword, verifyPassword } from "../middleware/auth.js";
import * as schema from "../db/schema.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const client = postgres(DATABASE_URL);
const db = drizzle(client);

const authRouter = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  orgName: z.string().min(1),
  industry: z.string().optional(),
  size: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { email, password, name, orgName, industry, size } = parsed.data;

  // Check if user already exists
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Email already registered" }, 409);
  }

  // Create organization
  const orgId = uuidv4();
  await db.insert(schema.organizations).values({
    id: orgId,
    name: orgName,
    industry: industry ?? null,
    size: size ?? null,
  });

  // Create user
  const userId = uuidv4();
  const passwordHash = await hashPassword(password);
  await db.insert(schema.users).values({
    id: userId,
    orgId,
    email,
    passwordHash,
    name,
    role: "admin",
  });

  const token = signToken({ userId, orgId, email, role: "admin" });

  return c.json({
    token,
    user: { id: userId, email, name, role: "admin" },
    organization: { id: orgId, name: orgName },
  }, 201);
});

authRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;

  const users = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const user = users[0];

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = signToken({
    userId: user.id,
    orgId: user.orgId,
    email: user.email,
    role: user.role,
  });

  return c.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

export { authRouter };
