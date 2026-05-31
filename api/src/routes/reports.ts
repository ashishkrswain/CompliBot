import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middleware/auth.js";
import { reportGenerationLimiter } from "../middleware/rate-limit.js";
import { generateReport } from "../services/report-generator.js";
import type { ReportGenerationInput } from "../services/report-generator.js";
import * as schema from "../db/schema.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const client = postgres(DATABASE_URL);
const db = drizzle(client);

const reportsRouter = new Hono();
reportsRouter.use("*", authMiddleware);

const generateReportSchema = z.object({
  projectId: z.string().uuid(),
  reportType: z.enum([
    "OSHA_300",
    "EPA_TIER2",
    "MAINTENANCE_AUDIT",
    "SAFETY_INSPECTION",
    "HIPAA_SRA",
    "HIPAA_POLICIES",
    "HIPAA_BREACH",
    "HIPAA_BAA",
    "BLOODBORNE",
    "COMPLIANCE_PROGRAM",
    "BSA_AML",
    "BSA_AML_RISK",
    "BSA_PROGRAM",
    "SAR",
    "SAR_NARRATIVE",
    "CRA",
    "CRA_ASSESSMENT",
    "FFIEC",
    "FFIEC_CYBER",
    "VENDOR_RISK",
    "SOC2_CONTROLS",
    "SOC2_POLICIES",
    "GDPR_DPIA",
    "GDPR_ROPA",
    "ISO27001_SOA",
    "CCPA_COMPLIANCE",
    "PCI_DSS",
    "NIST_CSF",
    "FEDRAMP",
    "EMERGENCY_ACTION_PLAN",
  ]),
  facilityId: z.string().uuid().optional(),
  dateRangeStart: z.string(),
  dateRangeEnd: z.string(),
});

const reviseSchema = z.object({
  comments: z.string().min(1),
  sections: z.array(z.string().uuid()).optional(),
});

reportsRouter.post("/generate", reportGenerationLimiter(), async (c) => {
  const orgId = c.get("orgId") as string;
  const body = await c.req.json();
  const parsed = generateReportSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { projectId, reportType, facilityId, dateRangeStart, dateRangeEnd } = parsed.data;

  // Verify project belongs to org
  const projectResults = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.orgId, orgId)))
    .limit(1);

  if (projectResults.length === 0) {
    return c.json({ error: "Project not found" }, 404);
  }

  // Get facility info
  const targetFacilityId = facilityId ?? projectResults[0]!.facilityId;
  let facilityName = "Unknown Facility";
  let facilityAddress = "";
  let facilityType = "Industrial Facility";
  let employeeCount = 100;
  let naicsCode = "";

  if (targetFacilityId) {
    const facilityResults = await db
      .select()
      .from(schema.facilities)
      .where(eq(schema.facilities.id, targetFacilityId))
      .limit(1);

    if (facilityResults[0]) {
      const facility = facilityResults[0];
      facilityName = facility.name;
      facilityAddress = [facility.address, facility.city, facility.state, facility.zip].filter(Boolean).join(", ");
      facilityType = facility.facilityType ?? "Industrial Facility";
      employeeCount = facility.employeeCount ?? 100;
      naicsCode = facility.naicsCode ?? "";
    }
  }

  // Get extracted data from project documents
  const docs = await db.select().from(schema.documents).where(eq(schema.documents.projectId, projectId));
  const allExtracted: unknown[] = [];

  for (const doc of docs) {
    const extracted = await db
      .select()
      .from(schema.extractedData)
      .where(eq(schema.extractedData.documentId, doc.id));
    for (const ext of extracted) {
      allExtracted.push(ext.structured);
    }
  }

  // Create report record
  const reportId = uuidv4();
  await db.insert(schema.reports).values({
    id: reportId,
    orgId,
    projectId,
    facilityId: targetFacilityId ?? null,
    reportType,
    title: `${reportType} Report — Generating...`,
    status: "generating",
    dateRangeStart: new Date(dateRangeStart),
    dateRangeEnd: new Date(dateRangeEnd),
  });

  // Generate report asynchronously
  generateReportAsync(reportId, {
    projectId,
    reportType,
    facilityName,
    facilityAddress,
    facilityType,
    employeeCount,
    naicsCode,
    dateRangeStart,
    dateRangeEnd,
    operationalData: docs.map((d) => d.rawContent ?? "").join("\n\n---\n\n"),
    extractedRecords: allExtracted.flat() as unknown[],
  }).catch((err: unknown) => {
    console.error(`Report generation failed for ${reportId}:`, err);
  });

  return c.json({ reportId, status: "generating" }, 202);
});

async function generateReportAsync(reportId: string, input: ReportGenerationInput): Promise<void> {
  try {
    const result = await generateReport(input);

    // Update report
    await db
      .update(schema.reports)
      .set({
        title: result.title,
        status: "draft",
        summary: result.summary,
        complianceScore: result.complianceScore,
        updatedAt: new Date(),
      })
      .where(eq(schema.reports.id, reportId));

    // Insert sections
    for (const section of result.sections) {
      await db.insert(schema.reportSections).values({
        id: uuidv4(),
        reportId,
        sectionOrder: section.order,
        title: section.title,
        content: section.content,
        citations: section.citations as unknown as Record<string, unknown>,
        findings: section.findings as unknown as Record<string, unknown>,
        recommendations: section.recommendations as unknown as Record<string, unknown>,
      });
    }

    // Insert gaps
    const report = await db.select().from(schema.reports).where(eq(schema.reports.id, reportId)).limit(1);
    if (report[0]) {
      for (const gap of result.gaps) {
        await db.insert(schema.complianceGaps).values({
          id: uuidv4(),
          orgId: report[0].orgId,
          projectId: report[0].projectId,
          reportId,
          facilityId: report[0].facilityId,
          standard: gap.standard,
          requirement: gap.requirement,
          currentState: gap.currentState,
          severity: gap.severity === "informational" ? "low" : gap.severity,
          recommendedAction: gap.recommendedAction,
        });
      }
    }

    // Update project status
    await db
      .update(schema.projects)
      .set({ status: "review", updatedAt: new Date() })
      .where(eq(schema.projects.id, input.projectId));
  } catch (err: unknown) {
    console.error(`Report generation error for ${reportId}:`, err);
    await db.update(schema.reports).set({
      status: "failed",
      title: `${input.reportType} Report — Generation Failed`,
      summary: `Report generation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      updatedAt: new Date(),
    }).where(eq(schema.reports.id, reportId));
  }
}

reportsRouter.get("/", async (c) => {
  const orgId = c.get("orgId") as string;
  const projectId = c.req.query("projectId");

  let reportsList;
  if (projectId) {
    reportsList = await db
      .select()
      .from(schema.reports)
      .where(and(eq(schema.reports.orgId, orgId), eq(schema.reports.projectId, projectId)));
  } else {
    reportsList = await db.select().from(schema.reports).where(eq(schema.reports.orgId, orgId));
  }

  return c.json({ reports: reportsList });
});

reportsRouter.get("/:id", async (c) => {
  const orgId = c.get("orgId") as string;
  const reportId = c.req.param("id");

  const reportResults = await db
    .select()
    .from(schema.reports)
    .where(and(eq(schema.reports.id, reportId), eq(schema.reports.orgId, orgId)))
    .limit(1);

  const report = reportResults[0];
  if (!report) {
    return c.json({ error: "Report not found" }, 404);
  }

  const sections = await db
    .select()
    .from(schema.reportSections)
    .where(eq(schema.reportSections.reportId, reportId));

  const gaps = await db
    .select()
    .from(schema.complianceGaps)
    .where(eq(schema.complianceGaps.reportId, reportId));

  return c.json({ report, sections: sections.sort((a, b) => a.sectionOrder - b.sectionOrder), gaps });
});

reportsRouter.get("/:id/download", async (c) => {
  const orgId = c.get("orgId") as string;
  const reportId = c.req.param("id");

  const reportResults = await db
    .select()
    .from(schema.reports)
    .where(and(eq(schema.reports.id, reportId), eq(schema.reports.orgId, orgId)))
    .limit(1);

  const report = reportResults[0];
  if (!report) {
    return c.json({ error: "Report not found" }, 404);
  }

  const sections = await db
    .select()
    .from(schema.reportSections)
    .where(eq(schema.reportSections.reportId, reportId));

  const sortedSections = sections.sort((a, b) => a.sectionOrder - b.sectionOrder);

  // Build PDF-ready markdown
  let markdown = `# ${report.title}\n\n`;
  markdown += `**Generated:** ${report.createdAt.toISOString().split("T")[0]}\n`;
  markdown += `**Status:** ${report.status}\n`;
  markdown += `**Compliance Score:** ${report.complianceScore}%\n\n`;
  markdown += `---\n\n`;
  markdown += `## Executive Summary\n\n${report.summary}\n\n`;

  for (const section of sortedSections) {
    markdown += `## ${section.title}\n\n${section.content}\n\n`;
  }

  c.header("Content-Type", "text/markdown");
  c.header("Content-Disposition", `attachment; filename="${report.title.replace(/[^a-zA-Z0-9 ]/g, "")}.md"`);
  return c.body(markdown);
});

reportsRouter.post("/:id/approve", async (c) => {
  const orgId = c.get("orgId") as string;
  const userId = c.get("userId") as string;
  const reportId = c.req.param("id");

  const reportResults = await db
    .select()
    .from(schema.reports)
    .where(and(eq(schema.reports.id, reportId), eq(schema.reports.orgId, orgId)))
    .limit(1);

  if (reportResults.length === 0) {
    return c.json({ error: "Report not found" }, 404);
  }

  await db
    .update(schema.reports)
    .set({
      status: "approved",
      approvedBy: userId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.reports.id, reportId));

  return c.json({ status: "approved", approvedAt: new Date().toISOString() });
});

reportsRouter.post("/:id/revise", async (c) => {
  const orgId = c.get("orgId") as string;
  const reportId = c.req.param("id");
  const body = await c.req.json();
  const parsed = reviseSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const reportResults = await db
    .select()
    .from(schema.reports)
    .where(and(eq(schema.reports.id, reportId), eq(schema.reports.orgId, orgId)))
    .limit(1);

  if (reportResults.length === 0) {
    return c.json({ error: "Report not found" }, 404);
  }

  await db
    .update(schema.reports)
    .set({
      status: "revision_requested",
      metadata: { revisionComments: parsed.data.comments, sectionsToRevise: parsed.data.sections ?? [] },
      updatedAt: new Date(),
    })
    .where(eq(schema.reports.id, reportId));

  return c.json({ status: "revision_requested", comments: parsed.data.comments });
});

export { reportsRouter };
