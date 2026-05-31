import { generateReportWithLLM, parseReportSections } from "../../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../../services/report-generator.js";
import { getStateBreachLaw } from "../../data/healthcare/state-breach-laws.js";
import { HIPAA_PENALTY_TIERS } from "../../data/healthcare/penalties.js";

const HIPAA_BREACH_SYSTEM_PROMPT = `You are an expert HIPAA Privacy and Breach Response Officer generating a complete Breach Assessment and Notification Package per 45 CFR 164.400-414.

Your assessment MUST include:

1. FOUR-FACTOR RISK ASSESSMENT per HHS Guidance (78 FR 5565):
   - Factor 1: Nature and extent of PHI involved (types of identifiers, sensitivity)
   - Factor 2: Unauthorized person who used the PHI or to whom the disclosure was made
   - Factor 3: Whether the PHI was actually acquired or viewed
   - Factor 4: Extent to which the risk to the PHI has been mitigated

2. BREACH DETERMINATION:
   - Apply the presumption of breach per §164.402(2)
   - Determine if low probability of compromise exists based on 4-factor analysis
   - Document the determination with supporting rationale

3. IF BREACH DETERMINED:
   - Individual notification letter per §164.404 (plain language, required content elements)
   - HHS/OCR notification per §164.408
   - Media notification if 500+ individuals in a state per §164.406
   - State AG notification per applicable state laws
   - Corrective action plan

4. DOCUMENTATION:
   - Complete breach log entry per §164.530(j)
   - Investigation timeline
   - Evidence preservation notes

All citations must reference specific HIPAA sections. Content must be professional quality suitable for OCR review and potential legal proceedings.`;

interface BreachInput {
  incidentDescription: string;
  phiTypes: string[];
  individualsAffected: number;
  dateDiscovered: string;
  dateOccurred: string;
  unauthorizedPerson: string;
  wasPhiViewed: boolean;
  mitigationsTaken: string[];
  affectedStates: string[];
}

interface FourFactorAssessment {
  factor1: {
    score: number;
    analysis: string;
    phiTypes: string[];
    sensitivityLevel: "high" | "medium" | "low";
  };
  factor2: {
    score: number;
    analysis: string;
    recipientType: string;
    obligationsToProtect: boolean;
  };
  factor3: {
    score: number;
    analysis: string;
    wasViewed: boolean;
    wasAcquired: boolean;
  };
  factor4: {
    score: number;
    analysis: string;
    mitigations: string[];
    mitigationEffectiveness: "high" | "medium" | "low";
  };
  overallRisk: "high" | "medium" | "low";
  determination: "breach" | "non_breach";
  rationale: string;
}

export async function generateHipaaBreachReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const breachInput = extractBreachInput(input);
  const fourFactorResult = performFourFactorAssessment(breachInput);
  const notificationRequirements = determineNotificationRequirements(breachInput, fourFactorResult);

  const additionalContext = buildBreachContext(breachInput, fourFactorResult, notificationRequirements);

  const rawContent = await generateReportWithLLM(
    input,
    HIPAA_BREACH_SYSTEM_PROMPT,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = buildBreachGaps(breachInput, fourFactorResult);

  const determinationLabel = fourFactorResult.determination === "breach" ? "BREACH CONFIRMED" : "NON-BREACH (Low Probability of Compromise)";

  return {
    title: `HIPAA Breach Assessment — ${input.facilityName} — ${breachInput.dateDiscovered}`,
    summary: `Breach assessment per 45 CFR 164.400-414 for incident discovered ${breachInput.dateDiscovered}. ${breachInput.individualsAffected} individuals potentially affected. Determination: ${determinationLabel}. PHI involved: ${breachInput.phiTypes.join(", ")}. ${fourFactorResult.determination === "breach" ? `Notification deadline: ${calculateNotificationDeadline(breachInput.dateDiscovered)}.` : "No notification required — documented low probability of compromise."}`,
    complianceScore: fourFactorResult.determination === "non_breach" ? 85 : 60,
    sections,
    gaps,
  };
}

function extractBreachInput(input: ReportGenerationInput): BreachInput {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const operationalData = input.operationalData;

  let incidentDescription = operationalData;
  let individualsAffected = 1;
  let dateDiscovered = input.dateRangeStart;
  let dateOccurred = input.dateRangeStart;
  let unauthorizedPerson = "Unknown";
  let wasPhiViewed = true;
  const phiTypes: string[] = [];
  const mitigationsTaken: string[] = [];
  const affectedStates: string[] = [];

  for (const record of records) {
    if (record["incidentDescription"] && typeof record["incidentDescription"] === "string") {
      incidentDescription = record["incidentDescription"];
    }
    if (record["individualsAffected"] && typeof record["individualsAffected"] === "number") {
      individualsAffected = record["individualsAffected"];
    }
    if (record["individualsAffected"] && typeof record["individualsAffected"] === "string") {
      individualsAffected = parseInt(record["individualsAffected"], 10) || 1;
    }
    if (record["dateDiscovered"] && typeof record["dateDiscovered"] === "string") {
      dateDiscovered = record["dateDiscovered"];
    }
    if (record["dateOccurred"] && typeof record["dateOccurred"] === "string") {
      dateOccurred = record["dateOccurred"];
    }
    if (record["unauthorizedPerson"] && typeof record["unauthorizedPerson"] === "string") {
      unauthorizedPerson = record["unauthorizedPerson"];
    }
    if (record["wasPhiViewed"] === false) {
      wasPhiViewed = false;
    }
    if (record["phiType"] && typeof record["phiType"] === "string") {
      phiTypes.push(record["phiType"]);
    }
    if (record["mitigation"] && typeof record["mitigation"] === "string") {
      mitigationsTaken.push(record["mitigation"]);
    }
    if (record["state"] && typeof record["state"] === "string") {
      affectedStates.push(record["state"]);
    }
  }

  // Default PHI types if none specified
  if (phiTypes.length === 0) {
    phiTypes.push("Patient names", "Medical record numbers");
    if (operationalData.toLowerCase().includes("ssn") || operationalData.toLowerCase().includes("social security")) {
      phiTypes.push("Social Security Numbers");
    }
    if (operationalData.toLowerCase().includes("diagnosis") || operationalData.toLowerCase().includes("treatment")) {
      phiTypes.push("Diagnosis/treatment information");
    }
  }

  return {
    incidentDescription,
    phiTypes,
    individualsAffected,
    dateDiscovered,
    dateOccurred,
    unauthorizedPerson,
    wasPhiViewed,
    mitigationsTaken,
    affectedStates: affectedStates.length > 0 ? affectedStates : ["Unknown"],
  };
}

function performFourFactorAssessment(breachInput: BreachInput): FourFactorAssessment {
  // Factor 1: Nature and extent of PHI
  const sensitiveIdentifiers = ["Social Security Numbers", "Financial account numbers", "Credit card numbers", "Driver's license numbers"];
  const clinicalData = ["Diagnosis/treatment information", "Mental health records", "Substance abuse records", "HIV/AIDS status", "Genetic information"];

  const hasSensitiveIdentifiers = breachInput.phiTypes.some((t) =>
    sensitiveIdentifiers.some((si) => t.toLowerCase().includes(si.toLowerCase()))
  );
  const hasClinicalData = breachInput.phiTypes.some((t) =>
    clinicalData.some((cd) => t.toLowerCase().includes(cd.toLowerCase()))
  );

  let factor1Score = 3; // Base: names + MRN
  if (hasSensitiveIdentifiers) factor1Score = 8;
  if (hasClinicalData) factor1Score = Math.max(factor1Score, 7);
  if (hasSensitiveIdentifiers && hasClinicalData) factor1Score = 10;
  if (breachInput.phiTypes.length <= 1) factor1Score = Math.min(factor1Score, 4);

  const factor1Sensitivity: "high" | "medium" | "low" = factor1Score >= 7 ? "high" : factor1Score >= 4 ? "medium" : "low";

  // Factor 2: Unauthorized person
  const isExternalThreat = breachInput.unauthorizedPerson.toLowerCase().includes("hacker") ||
    breachInput.unauthorizedPerson.toLowerCase().includes("unknown") ||
    breachInput.unauthorizedPerson.toLowerCase().includes("external");
  const isInternalWorkforce = breachInput.unauthorizedPerson.toLowerCase().includes("employee") ||
    breachInput.unauthorizedPerson.toLowerCase().includes("workforce") ||
    breachInput.unauthorizedPerson.toLowerCase().includes("staff");
  const isCoveredEntity = breachInput.unauthorizedPerson.toLowerCase().includes("provider") ||
    breachInput.unauthorizedPerson.toLowerCase().includes("covered entity") ||
    breachInput.unauthorizedPerson.toLowerCase().includes("health plan");

  let factor2Score = 5; // Default moderate
  let obligationsToProtect = false;
  if (isExternalThreat) {
    factor2Score = 9;
    obligationsToProtect = false;
  } else if (isInternalWorkforce) {
    factor2Score = 6;
    obligationsToProtect = true;
  } else if (isCoveredEntity) {
    factor2Score = 3;
    obligationsToProtect = true;
  }

  // Factor 3: Was PHI actually viewed/acquired
  let factor3Score = breachInput.wasPhiViewed ? 8 : 3;
  if (!breachInput.wasPhiViewed && breachInput.incidentDescription.toLowerCase().includes("encrypted")) {
    factor3Score = 1;
  }

  // Factor 4: Mitigations
  let factor4Score = 8; // High risk if no mitigations
  let mitigationEffectiveness: "high" | "medium" | "low" = "low";

  if (breachInput.mitigationsTaken.length > 0) {
    factor4Score -= breachInput.mitigationsTaken.length * 2;
    if (breachInput.mitigationsTaken.some((m) => m.toLowerCase().includes("destroy") || m.toLowerCase().includes("return"))) {
      factor4Score -= 3;
      mitigationEffectiveness = "high";
    } else if (breachInput.mitigationsTaken.some((m) => m.toLowerCase().includes("attestation") || m.toLowerCase().includes("confirm"))) {
      factor4Score -= 2;
      mitigationEffectiveness = "medium";
    }
  }
  factor4Score = Math.max(1, Math.min(10, factor4Score));

  // Overall determination
  const averageScore = (factor1Score + factor2Score + factor3Score + factor4Score) / 4;
  const overallRisk: "high" | "medium" | "low" = averageScore >= 6 ? "high" : averageScore >= 4 ? "medium" : "low";

  // Breach determination: breach unless LOW probability of compromise demonstrated
  const determination: "breach" | "non_breach" = averageScore < 4 ? "non_breach" : "breach";

  const rationale = determination === "breach"
    ? `Based on the four-factor risk assessment, the organization cannot demonstrate that there is a low probability that the PHI has been compromised. The overall risk score of ${averageScore.toFixed(1)}/10 exceeds the threshold for a non-breach determination. Per 45 CFR 164.402(2), the presumption of breach applies unless the covered entity demonstrates low probability of compromise.`
    : `Based on the four-factor risk assessment, the organization has demonstrated a low probability that the PHI has been compromised. The overall risk score of ${averageScore.toFixed(1)}/10 supports a determination that notification is not required. This determination is documented per §164.530(j) and §164.402(2).`;

  return {
    factor1: {
      score: factor1Score,
      analysis: `PHI involved includes ${breachInput.phiTypes.join(", ")}. ${hasSensitiveIdentifiers ? "Contains sensitive identifiers that create risk of identity theft." : "Does not contain identifiers commonly used for identity theft."} ${hasClinicalData ? "Contains clinical data with potential for stigmatization or discrimination." : ""}`,
      phiTypes: breachInput.phiTypes,
      sensitivityLevel: factor1Sensitivity,
    },
    factor2: {
      score: factor2Score,
      analysis: `Unauthorized recipient: ${breachInput.unauthorizedPerson}. ${obligationsToProtect ? "Recipient has independent obligations to protect PHI, which reduces risk." : "Recipient has no independent obligation to protect PHI, increasing risk of misuse."}`,
      recipientType: breachInput.unauthorizedPerson,
      obligationsToProtect,
    },
    factor3: {
      score: factor3Score,
      analysis: `${breachInput.wasPhiViewed ? "Evidence indicates PHI was actually accessed/viewed, increasing the probability of compromise." : "No evidence that PHI was actually acquired or viewed. However, inability to confirm non-access means risk cannot be fully eliminated."}`,
      wasViewed: breachInput.wasPhiViewed,
      wasAcquired: breachInput.wasPhiViewed,
    },
    factor4: {
      score: factor4Score,
      analysis: `Mitigations taken: ${breachInput.mitigationsTaken.length > 0 ? breachInput.mitigationsTaken.join("; ") : "No mitigations reported"}. ${mitigationEffectiveness === "high" ? "Mitigations substantially reduce risk." : mitigationEffectiveness === "medium" ? "Mitigations partially reduce risk but do not eliminate it." : "Insufficient mitigations to meaningfully reduce risk."}`,
      mitigations: breachInput.mitigationsTaken,
      mitigationEffectiveness,
    },
    overallRisk,
    determination,
    rationale,
  };
}

interface NotificationRequirements {
  individualNotificationRequired: boolean;
  individualNotificationDeadline: string;
  hhsNotificationRequired: boolean;
  hhsNotificationType: "immediate" | "annual_log";
  mediaNotificationRequired: boolean;
  mediaNotificationStates: string[];
  stateNotifications: Array<{
    state: string;
    agNotificationRequired: boolean;
    timeline: string;
    additionalRequirements: string[];
  }>;
}

function determineNotificationRequirements(
  breachInput: BreachInput,
  assessment: FourFactorAssessment
): NotificationRequirements {
  if (assessment.determination === "non_breach") {
    return {
      individualNotificationRequired: false,
      individualNotificationDeadline: "N/A",
      hhsNotificationRequired: false,
      hhsNotificationType: "annual_log",
      mediaNotificationRequired: false,
      mediaNotificationStates: [],
      stateNotifications: [],
    };
  }

  const deadline = calculateNotificationDeadline(breachInput.dateDiscovered);
  const mediaStates: string[] = [];

  // Check if 500+ individuals in any single state
  if (breachInput.individualsAffected >= 500) {
    for (const state of breachInput.affectedStates) {
      if (state !== "Unknown") {
        mediaStates.push(state);
      }
    }
    // If we don't know states but 500+ affected, flag for media notification
    if (mediaStates.length === 0 && breachInput.individualsAffected >= 500) {
      mediaStates.push("State determination needed");
    }
  }

  const stateNotifications = breachInput.affectedStates
    .filter((s) => s !== "Unknown")
    .map((stateCode) => {
      const stateLaw = getStateBreachLaw(stateCode);
      if (stateLaw) {
        return {
          state: stateLaw.state,
          agNotificationRequired: stateLaw.agNotificationRequired,
          timeline: stateLaw.notificationTimeline,
          additionalRequirements: stateLaw.contentRequirements,
        };
      }
      return {
        state: stateCode,
        agNotificationRequired: true,
        timeline: "Review state-specific requirements",
        additionalRequirements: ["State breach notification law must be reviewed"],
      };
    });

  return {
    individualNotificationRequired: true,
    individualNotificationDeadline: deadline,
    hhsNotificationRequired: true,
    hhsNotificationType: breachInput.individualsAffected >= 500 ? "immediate" : "annual_log",
    mediaNotificationRequired: mediaStates.length > 0,
    mediaNotificationStates: mediaStates,
    stateNotifications,
  };
}

function calculateNotificationDeadline(dateDiscovered: string): string {
  const discovered = new Date(dateDiscovered);
  const deadline = new Date(discovered);
  deadline.setDate(deadline.getDate() + 60);
  return deadline.toISOString().split("T")[0] ?? "60 days from discovery";
}

function buildBreachContext(
  breachInput: BreachInput,
  assessment: FourFactorAssessment,
  notifications: NotificationRequirements
): string {
  return `
BREACH INCIDENT DETAILS:
- Incident Description: ${breachInput.incidentDescription}
- Date Occurred: ${breachInput.dateOccurred}
- Date Discovered: ${breachInput.dateDiscovered}
- Individuals Affected: ${breachInput.individualsAffected}
- PHI Types Involved: ${breachInput.phiTypes.join(", ")}
- Unauthorized Person: ${breachInput.unauthorizedPerson}
- PHI Viewed/Acquired: ${breachInput.wasPhiViewed ? "Yes" : "No/Unknown"}
- Mitigations Taken: ${breachInput.mitigationsTaken.join("; ") || "None reported"}
- Affected States: ${breachInput.affectedStates.join(", ")}

FOUR-FACTOR RISK ASSESSMENT RESULTS:
Factor 1 (Nature of PHI): Score ${assessment.factor1.score}/10 — ${assessment.factor1.analysis}
Factor 2 (Unauthorized Person): Score ${assessment.factor2.score}/10 — ${assessment.factor2.analysis}
Factor 3 (PHI Viewed/Acquired): Score ${assessment.factor3.score}/10 — ${assessment.factor3.analysis}
Factor 4 (Mitigations): Score ${assessment.factor4.score}/10 — ${assessment.factor4.analysis}

DETERMINATION: ${assessment.determination === "breach" ? "BREACH — Notification Required" : "NON-BREACH — Low Probability of Compromise Demonstrated"}
Rationale: ${assessment.rationale}

NOTIFICATION REQUIREMENTS:
- Individual Notification: ${notifications.individualNotificationRequired ? `Required by ${notifications.individualNotificationDeadline}` : "Not Required"}
- HHS/OCR Notification: ${notifications.hhsNotificationRequired ? `Required (${notifications.hhsNotificationType === "immediate" ? "within 60 days — 500+ individuals" : "annual log submission — under 500 individuals"})` : "Not Required"}
- Media Notification: ${notifications.mediaNotificationRequired ? `Required in: ${notifications.mediaNotificationStates.join(", ")}` : "Not Required"}
- State Notifications: ${notifications.stateNotifications.length > 0 ? notifications.stateNotifications.map((s) => `${s.state} (AG: ${s.agNotificationRequired ? "Yes" : "No"})`).join("; ") : "Review applicable state laws"}

PENALTY CONTEXT:
- Tier 1 (Lack of Knowledge): $${HIPAA_PENALTY_TIERS[0]!.minimumPerViolation}-$${HIPAA_PENALTY_TIERS[0]!.maximumPerViolation}/violation
- Tier 2 (Reasonable Cause): $${HIPAA_PENALTY_TIERS[1]!.minimumPerViolation}-$${HIPAA_PENALTY_TIERS[1]!.maximumPerViolation}/violation
- Tier 3 (Willful Neglect, Corrected): $${HIPAA_PENALTY_TIERS[2]!.minimumPerViolation}-$${HIPAA_PENALTY_TIERS[2]!.maximumPerViolation}/violation
- Tier 4 (Willful Neglect, Not Corrected): $${HIPAA_PENALTY_TIERS[3]!.minimumPerViolation}-$${HIPAA_PENALTY_TIERS[3]!.maximumPerViolation}/violation

Generate a complete breach assessment report including:
1. Executive Summary of the incident
2. Investigation timeline
3. Complete Four-Factor Risk Assessment with detailed analysis
4. Breach/Non-Breach Determination with legal rationale
${assessment.determination === "breach" ? `5. Individual Notification Letter (plain language, all required elements per §164.404(c))
6. HHS/OCR Notification details
${notifications.mediaNotificationRequired ? "7. Media Notification per §164.406" : ""}
8. State-specific notification requirements
9. Corrective Action Plan
10. Breach Log Entry per §164.530(j)` : `5. Documentation of Non-Breach Determination
6. Breach Log Entry per §164.530(j)
7. Preventive Recommendations`}`;
}

function buildBreachGaps(breachInput: BreachInput, assessment: FourFactorAssessment): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  if (assessment.determination === "breach") {
    gaps.push({
      standard: "45 CFR 164.404(b)",
      requirement: "Individual notification without unreasonable delay, no later than 60 calendar days from discovery",
      currentState: `Breach discovered ${breachInput.dateDiscovered}. ${breachInput.individualsAffected} individuals require notification by ${calculateNotificationDeadline(breachInput.dateDiscovered)}`,
      severity: "critical",
      recommendedAction: "Prepare and send individual notification letters to all affected individuals containing all required elements per §164.404(c): description of breach, types of information involved, steps to protect themselves, entity's response, contact procedures",
    });

    if (breachInput.individualsAffected >= 500) {
      gaps.push({
        standard: "45 CFR 164.408(b)",
        requirement: "HHS notification for breaches affecting 500+ individuals — within 60 days of discovery",
        currentState: `${breachInput.individualsAffected} individuals affected; immediate HHS notification required via OCR breach portal`,
        severity: "critical",
        recommendedAction: "Submit breach notification to HHS Secretary via OCR breach portal (https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf) within 60 days of discovery",
      });

      gaps.push({
        standard: "45 CFR 164.406",
        requirement: "Media notification for breaches affecting 500+ individuals in a single state/jurisdiction",
        currentState: `${breachInput.individualsAffected} individuals affected; media notification likely required`,
        severity: "high",
        recommendedAction: "Provide notice to prominent media outlets serving the state(s) where 500+ affected individuals reside, within 60 days of discovery",
      });
    }
  }

  // Corrective action gaps
  if (breachInput.mitigationsTaken.length === 0) {
    gaps.push({
      standard: "45 CFR 164.308(a)(6)(ii)",
      requirement: "Mitigate harmful effects of security incidents that are known",
      currentState: "No mitigations have been implemented in response to this incident",
      severity: "high",
      recommendedAction: "Immediately implement mitigations: revoke unauthorized access, change compromised credentials, enhance monitoring of affected systems, offer credit monitoring if financial data involved",
    });
  }

  // Post-incident improvements
  gaps.push({
    standard: "45 CFR 164.308(a)(1)(ii)(B)",
    requirement: "Risk Management — implement security measures to reduce risks",
    currentState: "Incident indicates potential gaps in existing security controls",
    severity: "medium",
    recommendedAction: "Update risk analysis to incorporate lessons learned from this incident; implement additional controls to prevent recurrence; document changes to security program",
  });

  gaps.push({
    standard: "45 CFR 164.308(a)(5)",
    requirement: "Security Awareness and Training — address incident-related training needs",
    currentState: "Workforce may benefit from additional training related to the incident cause",
    severity: "medium",
    recommendedAction: "Provide targeted training to workforce members on the specific vulnerability/behavior that led to this incident; update security awareness materials",
  });

  return gaps;
}
