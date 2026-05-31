import { Hono } from "hono";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import * as schema from "../db/schema.js";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://complibot:complibot@localhost:5432/complibot";
const client = postgres(DATABASE_URL);
const db = drizzle(client);

const exportRouter = new Hono();
exportRouter.use("*", authMiddleware);

exportRouter.get("/reports/:reportId/export", async (c) => {
  const orgId = c.get("orgId") as string;
  const reportId = c.req.param("reportId");

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

  const gaps = await db
    .select()
    .from(schema.complianceGaps)
    .where(eq(schema.complianceGaps.reportId, reportId));

  const generatedDate = report.createdAt.toISOString().split("T")[0];
  const companyName = "CompliBot Report";

  const tableOfContents = sortedSections
    .map((s, i) => `<li><a href="#section-${i + 1}">${escapeHtml(s.title)}</a></li>`)
    .join("\n        ");

  const sectionsHtml = sortedSections
    .map((s, i) => {
      const citations = Array.isArray(s.citations) ? (s.citations as string[]) : [];
      const citationsHtml = citations.length > 0
        ? `<div class="citations"><strong>Citations:</strong> ${citations.map((c) => `<span class="citation">${escapeHtml(String(c))}</span>`).join(", ")}</div>`
        : "";

      return `
      <section id="section-${i + 1}" class="report-section">
        <h2>${escapeHtml(s.title)}</h2>
        <div class="section-content">${formatContent(s.content)}</div>
        ${citationsHtml}
      </section>`;
    })
    .join("\n");

  const gapsTableRows = gaps
    .map((g) => `
          <tr class="severity-${g.severity}">
            <td><span class="severity-badge ${g.severity}">${g.severity.toUpperCase()}</span></td>
            <td>${escapeHtml(g.standard)}</td>
            <td>${escapeHtml(g.requirement)}</td>
            <td>${escapeHtml(g.currentState)}</td>
            <td>${escapeHtml(g.recommendedAction)}</td>
          </tr>`)
    .join("\n");

  const gapsSection = gaps.length > 0
    ? `
      <section id="gaps" class="report-section">
        <h2>Compliance Gaps</h2>
        <table class="gaps-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Standard</th>
              <th>Requirement</th>
              <th>Current State</th>
              <th>Recommended Action</th>
            </tr>
          </thead>
          <tbody>${gapsTableRows}
          </tbody>
        </table>
      </section>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(report.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #1a365d;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 22pt;
      color: #1a365d;
      margin-bottom: 8px;
    }
    .header .company-name {
      font-size: 14pt;
      color: #4a5568;
      margin-bottom: 4px;
    }
    .header .report-meta {
      font-size: 10pt;
      color: #718096;
    }
    .score-badge {
      display: inline-block;
      background: #1a365d;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 8px;
    }
    .toc {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 20px 30px;
      margin-bottom: 30px;
    }
    .toc h3 {
      font-size: 13pt;
      color: #2d3748;
      margin-bottom: 12px;
    }
    .toc ol {
      padding-left: 20px;
    }
    .toc li {
      margin-bottom: 4px;
      font-size: 10pt;
    }
    .toc a {
      color: #2b6cb0;
      text-decoration: none;
    }
    .report-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .report-section h2 {
      font-size: 15pt;
      color: #1a365d;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .section-content {
      white-space: pre-wrap;
      font-size: 10.5pt;
    }
    .citations {
      margin-top: 12px;
      padding: 8px 12px;
      background: #edf2f7;
      border-left: 3px solid #4299e1;
      font-size: 9pt;
    }
    .citation {
      font-family: monospace;
      background: #fff;
      padding: 1px 4px;
      border-radius: 2px;
    }
    .gaps-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-top: 12px;
    }
    .gaps-table th, .gaps-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    .gaps-table th {
      background: #1a365d;
      color: white;
      font-weight: 600;
    }
    .gaps-table tr:nth-child(even) {
      background: #f7fafc;
    }
    .severity-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: bold;
      color: white;
    }
    .severity-badge.critical { background: #c53030; }
    .severity-badge.high { background: #dd6b20; }
    .severity-badge.medium { background: #d69e2e; }
    .severity-badge.low { background: #38a169; }
    .severity-badge.informational { background: #718096; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 2px solid #1a365d;
      font-size: 9pt;
      color: #718096;
      text-align: center;
    }
    @media print {
      body { padding: 0; max-width: none; }
      .toc { page-break-after: always; }
      .report-section { page-break-inside: avoid; }
      .gaps-table { page-break-inside: auto; }
      .gaps-table tr { page-break-inside: avoid; }
      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
      }
      @page {
        margin: 0.75in;
        @bottom-center { content: "Page " counter(page) " of " counter(pages); }
      }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="company-name">${escapeHtml(companyName)}</div>
    <h1>${escapeHtml(report.title)}</h1>
    <div class="report-meta">
      Generated: ${generatedDate} | Status: ${report.status}
      ${report.dateRangeStart && report.dateRangeEnd ? ` | Period: ${report.dateRangeStart.toISOString().split("T")[0]} to ${report.dateRangeEnd.toISOString().split("T")[0]}` : ""}
    </div>
    ${report.complianceScore !== null ? `<div class="score-badge">Compliance Score: ${report.complianceScore}%</div>` : ""}
  </header>

  <nav class="toc">
    <h3>Table of Contents</h3>
    <ol>
      ${tableOfContents}
      ${gaps.length > 0 ? '<li><a href="#gaps">Compliance Gaps</a></li>' : ""}
    </ol>
  </nav>

  ${report.summary ? `
  <section class="report-section">
    <h2>Executive Summary</h2>
    <div class="section-content">${formatContent(report.summary)}</div>
  </section>` : ""}

  ${sectionsHtml}

  ${gapsSection}

  <footer class="footer">
    <p>${escapeHtml(report.title)} &mdash; Generated by CompliBot on ${generatedDate}</p>
    <p>This document is confidential and intended for authorized personnel only.</p>
  </footer>
</body>
</html>`;

  c.header("Content-Type", "text/html; charset=utf-8");
  return c.body(html);
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatContent(content: string): string {
  const escaped = escapeHtml(content);
  return escaped
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<)/, "<p>")
    .replace(/(?!>)$/, "</p>");
}

export { exportRouter };
