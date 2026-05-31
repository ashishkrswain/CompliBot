import { REPORT_SYSTEM_PROMPTS } from "../lib/prompts.js";
import { generateReportWithLLM, parseReportSections } from "../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../services/report-generator.js";

interface MaintenanceArea {
  name: string;
  standard: string;
  equipmentCount: number;
  inspectionsDue: number;
  inspectionsCompleted: number;
  overdueItems: number;
  findings: MaintenanceFinding[];
}

interface MaintenanceFinding {
  equipment: string;
  finding: string;
  severity: "critical" | "high" | "medium" | "low";
  standard: string;
  correctiveAction: string;
  dueDate: string;
}

export async function generateMaintenanceAuditReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const areas = buildMaintenanceAreas(input);
  const overallComplianceRate = calculateMaintenanceComplianceRate(areas);

  const additionalContext = `
MAINTENANCE COMPLIANCE AREAS:
${formatMaintenanceAreas(areas)}

OVERALL COMPLIANCE METRICS:
- Areas Assessed: ${areas.length}
- Overall Inspection Completion Rate: ${(overallComplianceRate * 100).toFixed(1)}%
- Total Overdue Items: ${areas.reduce((sum, a) => sum + a.overdueItems, 0)}
- Total Findings: ${areas.reduce((sum, a) => sum + a.findings.length, 0)}
- Critical Findings: ${areas.reduce((sum, a) => sum + a.findings.filter((f) => f.severity === "critical").length, 0)}
- High Findings: ${areas.reduce((sum, a) => sum + a.findings.filter((f) => f.severity === "high").length, 0)}

REGULATORY STANDARDS EVALUATED:
- 29 CFR 1910.147: Lockout/Tagout (LOTO) - Annual procedure inspections
- 29 CFR 1910.179: Overhead Cranes - Frequent and periodic inspections
- ASME BPVC / NBIC: Pressure vessel inspections per state requirements
- NFPA 70B: Electrical equipment maintenance
- NFPA 25: Water-based fire protection system maintenance
- ANSI/ASME A17.1: Elevator/escalator inspection and testing

Generate a comprehensive maintenance compliance audit report including:
1. Executive Summary with overall compliance score
2. Detailed findings by maintenance area
3. Equipment condition assessments
4. Regulatory citation for each non-compliance
5. Prioritized corrective action plan
6. Recommended preventive maintenance schedule improvements
7. Resource requirements for compliance remediation`;

  const rawContent = await generateReportWithLLM(
    input,
    REPORT_SYSTEM_PROMPTS.MAINTENANCE_AUDIT,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = identifyMaintenanceGaps(areas);

  return {
    title: `Maintenance Compliance Audit — ${input.facilityName} — ${input.dateRangeStart} to ${input.dateRangeEnd}`,
    summary: `Maintenance compliance audit covering ${areas.length} maintenance areas. Overall inspection completion rate: ${(overallComplianceRate * 100).toFixed(1)}%. ${areas.reduce((sum, a) => sum + a.overdueItems, 0)} overdue maintenance items identified. ${areas.reduce((sum, a) => sum + a.findings.filter((f) => f.severity === "critical").length, 0)} critical findings require immediate attention.`,
    complianceScore: Math.round(overallComplianceRate * 100),
    sections,
    gaps,
  };
}

function buildMaintenanceAreas(input: ReportGenerationInput): MaintenanceArea[] {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const areaMap = new Map<string, MaintenanceArea>();

  // Define standard maintenance areas
  const standardAreas: Array<{ name: string; standard: string }> = [
    { name: "Lockout/Tagout Procedures", standard: "29 CFR 1910.147" },
    { name: "Overhead Cranes", standard: "29 CFR 1910.179" },
    { name: "Pressure Vessels", standard: "ASME BPVC / NBIC" },
    { name: "Electrical Systems", standard: "NFPA 70B" },
    { name: "Fire Protection Systems", standard: "NFPA 25" },
    { name: "Elevators/Escalators", standard: "ANSI/ASME A17.1" },
  ];

  for (const area of standardAreas) {
    areaMap.set(area.name, {
      name: area.name,
      standard: area.standard,
      equipmentCount: 0,
      inspectionsDue: 0,
      inspectionsCompleted: 0,
      overdueItems: 0,
      findings: [],
    });
  }

  for (const record of records) {
    const serviceType = String(record["serviceType"] ?? record["type"] ?? "").toLowerCase();
    const condition = String(record["condition"] ?? "fair");
    const finding = String(record["findings"] ?? record["finding"] ?? "");
    const equipment = String(record["equipmentName"] ?? record["equipment"] ?? "Unknown");

    let areaName = "Electrical Systems"; // default
    if (serviceType.includes("loto") || serviceType.includes("lockout") || serviceType.includes("energy control")) {
      areaName = "Lockout/Tagout Procedures";
    } else if (serviceType.includes("crane") || serviceType.includes("hoist")) {
      areaName = "Overhead Cranes";
    } else if (serviceType.includes("pressure") || serviceType.includes("boiler") || serviceType.includes("vessel")) {
      areaName = "Pressure Vessels";
    } else if (serviceType.includes("fire") || serviceType.includes("sprinkler") || serviceType.includes("suppression")) {
      areaName = "Fire Protection Systems";
    } else if (serviceType.includes("elevator") || serviceType.includes("escalator") || serviceType.includes("lift")) {
      areaName = "Elevators/Escalators";
    } else if (serviceType.includes("electrical") || serviceType.includes("transformer") || serviceType.includes("breaker")) {
      areaName = "Electrical Systems";
    }

    const area = areaMap.get(areaName)!;
    area.equipmentCount += 1;
    area.inspectionsDue += 1;

    const isCompleted = record["status"] === "completed" || record["actionTaken"];
    if (isCompleted) {
      area.inspectionsCompleted += 1;
    } else {
      area.overdueItems += 1;
    }

    if (condition === "poor" || condition === "critical" || finding) {
      const severity = condition === "critical" ? "critical" : condition === "poor" ? "high" : "medium";
      area.findings.push({
        equipment,
        finding: finding || `Equipment in ${condition} condition — requires attention`,
        severity: severity as MaintenanceFinding["severity"],
        standard: area.standard,
        correctiveAction: String(record["actionTaken"] ?? record["correctiveAction"] ?? "Schedule immediate inspection and repair"),
        dueDate: String(record["nextServiceDue"] ?? new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]),
      });
    }
  }

  return Array.from(areaMap.values()).filter((a) => a.equipmentCount > 0 || a.findings.length > 0);
}

function calculateMaintenanceComplianceRate(areas: MaintenanceArea[]): number {
  const totalDue = areas.reduce((sum, a) => sum + a.inspectionsDue, 0);
  const totalCompleted = areas.reduce((sum, a) => sum + a.inspectionsCompleted, 0);
  if (totalDue === 0) return 1.0;
  return totalCompleted / totalDue;
}

function formatMaintenanceAreas(areas: MaintenanceArea[]): string {
  return areas
    .map((area) => {
      const completionRate = area.inspectionsDue > 0
        ? ((area.inspectionsCompleted / area.inspectionsDue) * 100).toFixed(1)
        : "N/A";
      return `${area.name} (${area.standard}):
  Equipment: ${area.equipmentCount} | Due: ${area.inspectionsDue} | Completed: ${area.inspectionsCompleted} (${completionRate}%)
  Overdue: ${area.overdueItems} | Findings: ${area.findings.length}
  ${area.findings.map((f) => `  - [${f.severity.toUpperCase()}] ${f.equipment}: ${f.finding}`).join("\n")}`;
    })
    .join("\n\n");
}

function identifyMaintenanceGaps(areas: MaintenanceArea[]): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  for (const area of areas) {
    // Overdue inspections
    if (area.overdueItems > 0) {
      gaps.push({
        standard: area.standard,
        requirement: `Complete all required inspections per ${area.standard}`,
        currentState: `${area.overdueItems} inspection(s) overdue in ${area.name}`,
        severity: area.overdueItems > 3 ? "critical" : area.overdueItems > 1 ? "high" : "medium",
        recommendedAction: `Immediately schedule overdue ${area.name.toLowerCase()} inspections. Assign qualified personnel and allocate budget for potential repairs discovered during inspection.`,
      });
    }

    // Critical findings
    const criticalFindings = area.findings.filter((f) => f.severity === "critical");
    for (const finding of criticalFindings) {
      gaps.push({
        standard: area.standard,
        requirement: `Maintain ${finding.equipment} in safe operating condition per ${area.standard}`,
        currentState: finding.finding,
        severity: "critical",
        recommendedAction: finding.correctiveAction,
      });
    }

    // High findings
    const highFindings = area.findings.filter((f) => f.severity === "high");
    if (highFindings.length > 0) {
      gaps.push({
        standard: area.standard,
        requirement: `Address equipment condition deficiencies per ${area.standard}`,
        currentState: `${highFindings.length} equipment item(s) in poor condition in ${area.name}`,
        severity: "high",
        recommendedAction: `Schedule repairs for: ${highFindings.map((f) => f.equipment).join(", ")}. Prioritize based on safety impact and operational criticality.`,
      });
    }

    // Low completion rate
    const completionRate = area.inspectionsDue > 0 ? area.inspectionsCompleted / area.inspectionsDue : 1;
    if (completionRate < 0.8 && area.inspectionsDue > 0) {
      gaps.push({
        standard: area.standard,
        requirement: `Maintain inspection completion rate above 80% for ${area.name}`,
        currentState: `Current completion rate: ${(completionRate * 100).toFixed(0)}% (${area.inspectionsCompleted}/${area.inspectionsDue})`,
        severity: completionRate < 0.5 ? "high" : "medium",
        recommendedAction: `Review and update preventive maintenance schedule. Consider additional maintenance personnel or contractor support to address backlog.`,
      });
    }
  }

  return gaps;
}
