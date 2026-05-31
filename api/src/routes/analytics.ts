import { Hono } from "hono";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql, and, gte } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import * as schema from "../db/schema.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const client = postgres(DATABASE_URL);
const db = drizzle(client);

const analyticsRouter = new Hono();
analyticsRouter.use("*", authMiddleware);

analyticsRouter.get("/overview", async (c) => {
  const orgId = c.get("orgId") as string;

  // Total reports generated
  const reportsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.reports)
    .where(eq(schema.reports.orgId, orgId));
  const totalReports = Number(reportsResult[0]?.count ?? 0);

  // Average compliance score
  const scoreResult = await db
    .select({ avg: sql<number>`COALESCE(AVG(compliance_score), 0)` })
    .from(schema.reports)
    .where(and(eq(schema.reports.orgId, orgId), sql`compliance_score IS NOT NULL`));
  const avgComplianceScore = Math.round(Number(scoreResult[0]?.avg ?? 0));

  // Open gaps
  const gapsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.complianceGaps)
    .where(and(eq(schema.complianceGaps.orgId, orgId), eq(schema.complianceGaps.resolved, false)));
  const openGaps = Number(gapsResult[0]?.count ?? 0);

  // Critical gaps
  const criticalGapsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.complianceGaps)
    .where(
      and(
        eq(schema.complianceGaps.orgId, orgId),
        eq(schema.complianceGaps.resolved, false),
        eq(schema.complianceGaps.severity, "critical")
      )
    );
  const criticalGaps = Number(criticalGapsResult[0]?.count ?? 0);

  // Active projects
  const projectsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.projects)
    .where(and(eq(schema.projects.orgId, orgId), sql`status NOT IN ('complete', 'archived')`));
  const activeProjects = Number(projectsResult[0]?.count ?? 0);

  // Reports this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const reportsThisMonthResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.reports)
    .where(and(eq(schema.reports.orgId, orgId), gte(schema.reports.createdAt, monthStart)));
  const reportsThisMonth = Number(reportsThisMonthResult[0]?.count ?? 0);

  // Estimated savings (industry avg: $5,000 per manual report, CompliBot: $500 avg)
  const manualCostPerReport = 5000;
  const complibotCostPerReport = 500;
  const estimatedSavings = totalReports * (manualCostPerReport - complibotCostPerReport);

  // Time savings (industry avg: 40 hours per report, CompliBot: 2 hours)
  const manualHoursPerReport = 40;
  const complibotHoursPerReport = 2;
  const hoursSaved = totalReports * (manualHoursPerReport - complibotHoursPerReport);

  return c.json({
    overview: {
      totalReports,
      avgComplianceScore,
      openGaps,
      criticalGaps,
      activeProjects,
      estimatedSavings,
      hoursSaved,
      costPerReport: complibotCostPerReport,
      manualCostPerReport,
      reportsThisMonth,
    },
  });
});

analyticsRouter.get("/timeline", async (c) => {
  const orgId = c.get("orgId") as string;
  const months = Number(c.req.query("months") ?? "12");

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Reports over time
  const reportsOverTime = await db
    .select({
      month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
      count: sql<number>`count(*)`,
      avgScore: sql<number>`COALESCE(AVG(compliance_score), 0)`,
    })
    .from(schema.reports)
    .where(and(eq(schema.reports.orgId, orgId), gte(schema.reports.createdAt, startDate)))
    .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM')`);

  // Gaps over time
  const gapsOverTime = await db
    .select({
      month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
      opened: sql<number>`count(*)`,
    })
    .from(schema.complianceGaps)
    .where(and(eq(schema.complianceGaps.orgId, orgId), gte(schema.complianceGaps.createdAt, startDate)))
    .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM')`);

  // Gaps resolved over time
  const gapsResolvedOverTime = await db
    .select({
      month: sql<string>`TO_CHAR(resolved_at, 'YYYY-MM')`,
      resolved: sql<number>`count(*)`,
    })
    .from(schema.complianceGaps)
    .where(
      and(
        eq(schema.complianceGaps.orgId, orgId),
        eq(schema.complianceGaps.resolved, true),
        sql`resolved_at IS NOT NULL`,
        gte(schema.complianceGaps.resolvedAt, startDate)
      )
    )
    .groupBy(sql`TO_CHAR(resolved_at, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(resolved_at, 'YYYY-MM')`);

  return c.json({
    timeline: {
      reports: reportsOverTime.map((r) => ({
        month: r.month,
        count: Number(r.count),
        avgScore: Math.round(Number(r.avgScore)),
      })),
      gapsOpened: gapsOverTime.map((g) => ({
        month: g.month,
        count: Number(g.opened),
      })),
      gapsResolved: gapsResolvedOverTime.map((g) => ({
        month: g.month,
        count: Number(g.resolved),
      })),
    },
  });
});

export { analyticsRouter };
