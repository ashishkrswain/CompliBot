import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { performComplianceCheck } from "../services/compliance-checker.js";
import { getAllStandardSummaries, getStandardsByAgency } from "../services/regulatory-engine.js";

const complianceRouter = new Hono();
complianceRouter.use("*", authMiddleware);

const complianceCheckSchema = z.object({
  operationalData: z.string().min(1),
  facilityType: z.string().min(1),
  industry: z.string().min(1),
});

complianceRouter.post("/check", async (c) => {
  const body = await c.req.json();
  const parsed = complianceCheckSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { operationalData, facilityType, industry } = parsed.data;

  try {
    const result = await performComplianceCheck(operationalData, facilityType, industry);
    return c.json({ assessment: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Compliance check failed";
    return c.json({ error: message }, 500);
  }
});

complianceRouter.get("/requirements/:standard", async (c) => {
  const standard = c.req.param("standard").toUpperCase();

  let summaries;
  switch (standard) {
    case "OSHA":
      summaries = getStandardsByAgency("OSHA");
      break;
    case "EPA":
      summaries = getStandardsByAgency("EPA");
      break;
    case "NFPA":
      summaries = getStandardsByAgency("NFPA");
      break;
    case "ALL":
      summaries = getAllStandardSummaries();
      break;
    default:
      // Try to find by specific code
      summaries = getAllStandardSummaries().filter(
        (s) => s.code.includes(standard) || s.title.toUpperCase().includes(standard)
      );
  }

  if (summaries.length === 0) {
    return c.json({ error: `No requirements found for standard: ${standard}` }, 404);
  }

  return c.json({ standard, requirements: summaries });
});

export { complianceRouter };
