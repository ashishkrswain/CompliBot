import { REPORT_SYSTEM_PROMPTS } from "../lib/prompts.js";
import { generateReportWithLLM, parseReportSections } from "../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../services/report-generator.js";

interface InspectionFinding {
  id: string;
  location: string;
  category: string;
  oshaSubpart: string;
  description: string;
  severity: "imminent_danger" | "serious" | "other_than_serious" | "de_minimis";
  standard: string;
  standardTitle: string;
  correctiveAction: string;
  abatementDeadline: string;
  estimatedCost: number;
  photoRef: string;
}

interface InspectionArea {
  name: string;
  findings: InspectionFinding[];
  positiveObservations: string[];
}

export async function generateSafetyInspectionReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const areas = buildInspectionAreas(input);
  const allFindings = areas.flatMap((a) => a.findings);
  const riskScore = calculateFacilityRiskScore(allFindings);

  const additionalContext = `
INSPECTION FINDINGS BY AREA:
${formatInspectionAreas(areas)}

FINDING SUMMARY:
- Total Findings: ${allFindings.length}
- Imminent Danger: ${allFindings.filter((f) => f.severity === "imminent_danger").length}
- Serious: ${allFindings.filter((f) => f.severity === "serious").length}
- Other-than-Serious: ${allFindings.filter((f) => f.severity === "other_than_serious").length}
- De Minimis: ${allFindings.filter((f) => f.severity === "de_minimis").length}
- Estimated Total Remediation Cost: $${allFindings.reduce((sum, f) => sum + f.estimatedCost, 0).toLocaleString()}
- Facility Risk Score: ${riskScore}/100

POSITIVE OBSERVATIONS:
${areas.flatMap((a) => a.positiveObservations).map((o) => `- ${o}`).join("\n")}

OSHA SUBPART DISTRIBUTION:
${getSubpartDistribution(allFindings)}

Generate a comprehensive safety inspection report including:
1. Executive Summary with risk score and key findings
2. Inspection scope and methodology
3. Detailed findings by area with regulatory citations
4. Severity classification per OSHA enforcement policy
5. Positive observations (compliant areas)
6. Prioritized corrective action plan with timelines
7. Estimated abatement costs
8. Follow-up inspection recommendations`;

  const rawContent = await generateReportWithLLM(
    input,
    REPORT_SYSTEM_PROMPTS.SAFETY_INSPECTION,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = convertFindingsToGaps(allFindings);

  return {
    title: `Safety Inspection Report — ${input.facilityName} — ${new Date(input.dateRangeEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    summary: `Comprehensive safety inspection of ${input.facilityName}. ${allFindings.length} findings identified across ${areas.length} inspection areas. Risk Score: ${riskScore}/100. ${allFindings.filter((f) => f.severity === "imminent_danger").length} imminent danger conditions and ${allFindings.filter((f) => f.severity === "serious").length} serious violations require immediate attention.`,
    complianceScore: Math.max(0, 100 - riskScore),
    sections,
    gaps,
  };
}

function buildInspectionAreas(input: ReportGenerationInput): InspectionArea[] {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const areaMap = new Map<string, InspectionArea>();

  for (const [index, record] of records.entries()) {
    const location = String(record["location"] ?? "General Facility");
    const areaName = categorizeLocation(location);

    if (!areaMap.has(areaName)) {
      areaMap.set(areaName, { name: areaName, findings: [], positiveObservations: [] });
    }

    const area = areaMap.get(areaName)!;
    const hazardType = String(record["hazardType"] ?? record["type"] ?? "general");
    const { subpart, standard, standardTitle } = mapHazardToStandard(hazardType);
    const severity = mapSeverity(String(record["severity"] ?? "other_than_serious"));

    area.findings.push({
      id: `F-${String(index + 1).padStart(3, "0")}`,
      location,
      category: hazardType,
      oshaSubpart: subpart,
      description: String(record["description"] ?? ""),
      severity,
      standard,
      standardTitle,
      correctiveAction: String(record["correctiveAction"] ?? generateCorrectiveAction(hazardType, severity)),
      abatementDeadline: getAbatementDeadline(severity),
      estimatedCost: estimateRemediationCost(hazardType, severity),
      photoRef: String(record["photoRef"] ?? `Photo ${index + 1}`),
    });
  }

  // Add positive observations for areas not flagged
  for (const area of areaMap.values()) {
    area.positiveObservations = generatePositiveObservations(area.name, area.findings);
  }

  return Array.from(areaMap.values());
}

function categorizeLocation(location: string): string {
  const loc = location.toLowerCase();
  if (loc.includes("warehouse") || loc.includes("storage")) return "Warehouse & Storage";
  if (loc.includes("production") || loc.includes("manufacturing") || loc.includes("assembly")) return "Production Floor";
  if (loc.includes("maintenance") || loc.includes("shop") || loc.includes("mechanical")) return "Maintenance Shop";
  if (loc.includes("loading") || loc.includes("dock") || loc.includes("shipping")) return "Loading/Shipping Area";
  if (loc.includes("office") || loc.includes("admin")) return "Office/Administrative";
  if (loc.includes("exterior") || loc.includes("yard") || loc.includes("parking")) return "Exterior/Yard";
  if (loc.includes("electrical") || loc.includes("utility")) return "Electrical/Utility Rooms";
  return "General Facility Areas";
}

function mapHazardToStandard(hazardType: string): { subpart: string; standard: string; standardTitle: string } {
  const hazard = hazardType.toLowerCase();

  if (hazard.includes("fall") || hazard.includes("walking") || hazard.includes("floor") || hazard.includes("stair")) {
    return { subpart: "Subpart D", standard: "29 CFR 1910.22-30", standardTitle: "Walking-Working Surfaces" };
  }
  if (hazard.includes("exit") || hazard.includes("egress") || hazard.includes("emergency route")) {
    return { subpart: "Subpart E", standard: "29 CFR 1910.33-39", standardTitle: "Exit Routes, Emergency Action Plans" };
  }
  if (hazard.includes("chemical") || hazard.includes("hazmat") || hazard.includes("flammable")) {
    return { subpart: "Subpart H", standard: "29 CFR 1910.101-126", standardTitle: "Hazardous Materials" };
  }
  if (hazard.includes("ppe") || hazard.includes("protective") || hazard.includes("eye") || hazard.includes("glove")) {
    return { subpart: "Subpart I", standard: "29 CFR 1910.132-140", standardTitle: "Personal Protective Equipment" };
  }
  if (hazard.includes("lockout") || hazard.includes("confined") || hazard.includes("ventilation")) {
    return { subpart: "Subpart J", standard: "29 CFR 1910.141-147", standardTitle: "General Environmental Controls" };
  }
  if (hazard.includes("fire") || hazard.includes("extinguisher") || hazard.includes("sprinkler")) {
    return { subpart: "Subpart L", standard: "29 CFR 1910.155-165", standardTitle: "Fire Protection" };
  }
  if (hazard.includes("forklift") || hazard.includes("material handling") || hazard.includes("crane")) {
    return { subpart: "Subpart N", standard: "29 CFR 1910.176-184", standardTitle: "Materials Handling and Storage" };
  }
  if (hazard.includes("machine") || hazard.includes("guard") || hazard.includes("nip point")) {
    return { subpart: "Subpart O", standard: "29 CFR 1910.211-219", standardTitle: "Machinery and Machine Guarding" };
  }
  if (hazard.includes("electrical") || hazard.includes("wiring") || hazard.includes("arc")) {
    return { subpart: "Subpart S", standard: "29 CFR 1910.301-399", standardTitle: "Electrical" };
  }
  if (hazard.includes("noise") || hazard.includes("toxic") || hazard.includes("exposure")) {
    return { subpart: "Subpart Z", standard: "29 CFR 1910.1000-1096", standardTitle: "Toxic and Hazardous Substances" };
  }

  return { subpart: "Subpart D", standard: "29 CFR 1910.22", standardTitle: "General Requirements (Walking-Working Surfaces)" };
}

function mapSeverity(severity: string): InspectionFinding["severity"] {
  const sev = severity.toLowerCase();
  if (sev.includes("imminent") || sev.includes("danger")) return "imminent_danger";
  if (sev.includes("serious") || sev.includes("critical") || sev.includes("high")) return "serious";
  if (sev.includes("other") || sev.includes("medium") || sev.includes("moderate")) return "other_than_serious";
  return "de_minimis";
}

function generateCorrectiveAction(hazardType: string, severity: InspectionFinding["severity"]): string {
  const urgency = severity === "imminent_danger" ? "Immediately" : severity === "serious" ? "Within 7 days" : "Within 30 days";
  const hazard = hazardType.toLowerCase();

  if (hazard.includes("guard")) return `${urgency} install or repair machine guarding to prevent employee contact with moving parts`;
  if (hazard.includes("electrical")) return `${urgency} correct electrical hazard. De-energize affected circuit until qualified electrician completes repair`;
  if (hazard.includes("fall")) return `${urgency} install guardrails, repair walking surface, or implement fall protection measures`;
  if (hazard.includes("fire")) return `${urgency} replace/recharge fire extinguishers, clear exit routes, repair fire protection equipment`;
  if (hazard.includes("ppe")) return `${urgency} provide required PPE to affected employees and conduct training on proper use`;
  return `${urgency} address identified hazard and implement engineering or administrative controls`;
}

function getAbatementDeadline(severity: InspectionFinding["severity"]): string {
  const now = new Date();
  switch (severity) {
    case "imminent_danger":
      return "Immediate";
    case "serious":
      now.setDate(now.getDate() + 7);
      return now.toISOString().split("T")[0]!;
    case "other_than_serious":
      now.setDate(now.getDate() + 30);
      return now.toISOString().split("T")[0]!;
    case "de_minimis":
      now.setDate(now.getDate() + 90);
      return now.toISOString().split("T")[0]!;
  }
}

function estimateRemediationCost(hazardType: string, severity: InspectionFinding["severity"]): number {
  const baseCost = severity === "imminent_danger" ? 5000 : severity === "serious" ? 2500 : severity === "other_than_serious" ? 1000 : 250;
  const hazard = hazardType.toLowerCase();

  if (hazard.includes("electrical") || hazard.includes("structural")) return baseCost * 3;
  if (hazard.includes("machine") || hazard.includes("guard")) return baseCost * 2;
  if (hazard.includes("fire")) return baseCost * 2.5;
  return baseCost;
}

function getSubpartDistribution(findings: InspectionFinding[]): string {
  const distribution = new Map<string, number>();
  for (const finding of findings) {
    const count = distribution.get(finding.oshaSubpart) ?? 0;
    distribution.set(finding.oshaSubpart, count + 1);
  }
  return Array.from(distribution.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([subpart, count]) => `- ${subpart}: ${count} finding(s)`)
    .join("\n");
}

function generatePositiveObservations(areaName: string, findings: InspectionFinding[]): string[] {
  const observations: string[] = [];
  const findingCategories = new Set(findings.map((f) => f.category.toLowerCase()));

  if (!findingCategories.has("exit") && !findingCategories.has("egress")) {
    observations.push(`Emergency exit routes in ${areaName} are clearly marked and unobstructed`);
  }
  if (!findingCategories.has("housekeeping") && !findingCategories.has("floor")) {
    observations.push(`General housekeeping in ${areaName} is well-maintained`);
  }
  if (!findingCategories.has("fire")) {
    observations.push(`Fire protection equipment in ${areaName} is properly located and maintained`);
  }

  return observations;
}

function calculateFacilityRiskScore(findings: InspectionFinding[]): number {
  let score = 0;
  for (const finding of findings) {
    switch (finding.severity) {
      case "imminent_danger":
        score += 25;
        break;
      case "serious":
        score += 12;
        break;
      case "other_than_serious":
        score += 5;
        break;
      case "de_minimis":
        score += 1;
        break;
    }
  }
  return Math.min(100, score);
}

function convertFindingsToGaps(findings: InspectionFinding[]): GeneratedGap[] {
  return findings
    .filter((f) => f.severity !== "de_minimis")
    .map((f) => ({
      standard: f.standard,
      requirement: `${f.standardTitle} — ${f.standard}`,
      currentState: f.description,
      severity: f.severity === "imminent_danger" ? "critical" as const : f.severity === "serious" ? "high" as const : "medium" as const,
      recommendedAction: f.correctiveAction,
    }));
}

function formatInspectionAreas(areas: InspectionArea[]): string {
  return areas
    .map((area) => {
      return `${area.name}:
  Findings: ${area.findings.length}
  ${area.findings.map((f) => `  - [${f.severity.toUpperCase().replace("_", " ")}] ${f.id}: ${f.description.slice(0, 100)} (${f.standard})`).join("\n")}`;
    })
    .join("\n\n");
}
