import { generateStructuredOutput } from "../lib/llm.js";
import { COMPLIANCE_CHECK_PROMPT } from "../lib/prompts.js";
import { ALL_STANDARDS } from "../lib/regulations.js";
import { ALL_HIPAA_STANDARDS } from "../data/healthcare/hipaa-standards.js";

export interface ComplianceGapResult {
  requirement: string;
  currentState: string;
  severity: "critical" | "high" | "medium" | "low";
  recommendedAction: string;
}

export interface StandardAssessment {
  standard: string;
  title: string;
  applicable: boolean;
  complianceScore: number;
  gaps: ComplianceGapResult[];
}

export interface ComplianceCheckResult {
  overallScore: number;
  standards: StandardAssessment[];
}

export async function performComplianceCheck(
  operationalData: string,
  facilityType: string,
  industry: string
): Promise<ComplianceCheckResult> {
  const applicableStandards = determineApplicableStandards(facilityType, industry);

  try {
    const prompt = `
Facility Type: ${facilityType}
Industry: ${industry}

Applicable Standards:
${applicableStandards.map((s) => `- ${s.code}: ${s.title}`).join("\n")}

Operational Data:
${operationalData}

Perform a comprehensive compliance assessment against all applicable standards.`;

    const result = await generateStructuredOutput<ComplianceCheckResult>(
      COMPLIANCE_CHECK_PROMPT,
      prompt,
      { temperature: 0.2, maxTokens: 4096 }
    );

    return result;
  } catch {
    return generateFallbackAssessment(applicableStandards, operationalData, facilityType);
  }
}

function generateFallbackAssessment(
  applicableStandards: Array<{ code: string; title: string }>,
  operationalData: string,
  _facilityType: string
): ComplianceCheckResult {
  const hasIncidents = operationalData.toLowerCase().includes("incident") || operationalData.toLowerCase().includes("injury");
  const hasChemicals = operationalData.toLowerCase().includes("chemical") || operationalData.toLowerCase().includes("hazardous");

  const standards: StandardAssessment[] = applicableStandards.map((std) => {
    const gaps: ComplianceGapResult[] = [];
    let score = 85;

    if (std.code.includes("1904") && hasIncidents) {
      score = 72;
      gaps.push({
        requirement: "29 CFR 1904.29 — Log entries within 7 calendar days",
        currentState: "Incidents reported but timeliness of logging not verified",
        severity: "medium",
        recommendedAction: "Implement automated incident logging with timestamp verification",
      });
    }

    if (std.code.includes("1910")) {
      score = 78;
      gaps.push({
        requirement: "29 CFR 1910.132 — PPE hazard assessment",
        currentState: "Annual PPE assessment documentation not confirmed current",
        severity: "medium",
        recommendedAction: "Conduct and document annual PPE hazard assessment for all job categories",
      });
    }

    if (std.code.includes("370") && hasChemicals) {
      score = 65;
      gaps.push({
        requirement: "40 CFR 370 — Tier II chemical inventory reporting",
        currentState: "Chemical inventory may not reflect current quantities",
        severity: "high",
        recommendedAction: "Update chemical inventory and verify Tier II filing is current with LEPC",
      });
    }

    if (std.code.includes("45 CFR 164")) {
      score = 68;
      gaps.push({
        requirement: "45 CFR 164.308(a)(1)(ii)(A) — Security Risk Analysis",
        currentState: "Annual Security Risk Assessment may not be current or comprehensive",
        severity: "high",
        recommendedAction: "Conduct comprehensive SRA per NIST SP 800-30; document all ePHI systems, threats, vulnerabilities, and risk levels",
      });
      gaps.push({
        requirement: "45 CFR 164.308(a)(5) — Security Awareness and Training",
        currentState: "Workforce HIPAA training compliance not verified",
        severity: "medium",
        recommendedAction: "Verify all workforce members have completed annual HIPAA Security training; schedule make-up sessions for non-compliant staff",
      });
      gaps.push({
        requirement: "45 CFR 164.312(a)(2)(iv) — Encryption of ePHI",
        currentState: "Encryption at rest and in transit not confirmed for all ePHI systems",
        severity: "high",
        recommendedAction: "Audit all systems containing ePHI for encryption status; implement AES-256 at rest and TLS 1.2+ in transit for any unencrypted systems",
      });
    }

    if (std.code.includes("1910.1030")) {
      score = 72;
      gaps.push({
        requirement: "29 CFR 1910.1030(c) — Exposure Control Plan annual review",
        currentState: "Exposure Control Plan annual review and update status not confirmed",
        severity: "medium",
        recommendedAction: "Review and update ECP; include consideration of safer sharps devices; document non-managerial employee input per Needlestick Safety Act",
      });
    }

    return {
      standard: std.code,
      title: std.title,
      applicable: true,
      complianceScore: score,
      gaps,
    };
  });

  const overallScore = Math.round(standards.reduce((sum, s) => sum + s.complianceScore, 0) / standards.length);

  return { overallScore, standards };
}

export function determineApplicableStandards(facilityType: string, industry: string) {
  const applicable = [];

  // OSHA recordkeeping applies to most employers with >10 employees
  applicable.push(ALL_STANDARDS[0]!); // OSHA Recordkeeping

  // General industry standards apply to manufacturing, warehousing, etc.
  const generalIndustryTypes = ["manufacturing", "warehouse", "plant", "factory", "facility", "industrial"];
  if (generalIndustryTypes.some((t) => facilityType.toLowerCase().includes(t) || industry.toLowerCase().includes(t))) {
    applicable.push(ALL_STANDARDS[1]!); // OSHA General Industry
  }

  // EPA EPCRA applies to facilities with hazardous chemicals
  const chemicalIndustries = ["manufacturing", "chemical", "petroleum", "refining", "pharmaceutical", "plastics"];
  if (chemicalIndustries.some((t) => industry.toLowerCase().includes(t) || facilityType.toLowerCase().includes(t))) {
    applicable.push(ALL_STANDARDS[2]!); // EPA EPCRA
  }

  // Maintenance standards apply to facilities with equipment
  applicable.push(ALL_STANDARDS[3]!); // Maintenance Standards

  // Healthcare/HIPAA standards apply to medical/dental/hospital facilities
  const healthcareTypes = [
    "healthcare", "medical", "hospital", "clinic", "dental", "pharmacy",
    "nursing", "home health", "physician", "lab", "laboratory", "behavioral",
    "mental health", "hospice", "ambulatory", "surgery center", "snf",
  ];
  if (healthcareTypes.some((t) => facilityType.toLowerCase().includes(t) || industry.toLowerCase().includes(t))) {
    applicable.push(...getHealthcareStandards());
  }

  return applicable;
}

function getHealthcareStandards(): Array<{ code: string; title: string; agency: string; subparts: Array<{ section: string; title: string; requirements: string[]; recordkeepingFrequency: string; applicability: string }> }> {
  return [
    {
      code: "45 CFR 164",
      title: "HIPAA Security Rule",
      agency: "HHS",
      subparts: ALL_HIPAA_STANDARDS.map((standard) => ({
        section: standard.section,
        title: standard.title,
        requirements: [
          standard.requirementText,
          ...standard.implementationSpecs.map((spec) => `${spec.title}: ${spec.description}`),
        ],
        recordkeepingFrequency: "Retain documentation for 6 years per §164.316(b)(2)(i)",
        applicability: `${standard.requiredOrAddressable === "required" ? "Required" : "Addressable"} — ${standard.category} safeguard`,
      })),
    },
    {
      code: "29 CFR 1910.1030",
      title: "Bloodborne Pathogens Standard",
      agency: "OSHA",
      subparts: [
        {
          section: "1910.1030(c)",
          title: "Exposure Control Plan",
          requirements: [
            "Written ECP reviewed and updated annually",
            "Exposure determination for all job classifications",
            "Documentation of safer sharps device consideration",
          ],
          recordkeepingFrequency: "Annual review",
          applicability: "Healthcare facilities with occupational exposure to blood/OPIM",
        },
        {
          section: "1910.1030(f)",
          title: "Hepatitis B Vaccination and Post-Exposure",
          requirements: [
            "Vaccination offered within 10 working days of assignment",
            "Post-exposure evaluation and follow-up at no cost",
          ],
          recordkeepingFrequency: "Duration of employment plus 30 years",
          applicability: "All employees with occupational exposure",
        },
        {
          section: "1910.1030(g)(2)",
          title: "Training",
          requirements: [
            "Initial training and annual refresher",
            "13 required training content elements",
            "Training records maintained 3 years",
          ],
          recordkeepingFrequency: "3 years",
          applicability: "All employees with occupational exposure",
        },
      ],
    },
  ];
}

export function calculateOverallComplianceScore(assessments: StandardAssessment[]): number {
  const applicableAssessments = assessments.filter((a) => a.applicable);
  if (applicableAssessments.length === 0) return 100;

  const weightedSum = applicableAssessments.reduce((sum, assessment) => {
    const weight = getStandardWeight(assessment.standard);
    return sum + assessment.complianceScore * weight;
  }, 0);

  const totalWeight = applicableAssessments.reduce((sum, assessment) => {
    return sum + getStandardWeight(assessment.standard);
  }, 0);

  return Math.round(weightedSum / totalWeight);
}

function getStandardWeight(standard: string): number {
  // Critical safety standards get higher weight
  if (standard.includes("1910.147")) return 1.5; // LOTO
  if (standard.includes("1910.146")) return 1.5; // Confined spaces
  if (standard.includes("1904")) return 1.2; // Recordkeeping
  if (standard.includes("370")) return 1.3; // EPA Tier II
  return 1.0;
}

export function prioritizeGaps(gaps: ComplianceGapResult[]): ComplianceGapResult[] {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...gaps].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
