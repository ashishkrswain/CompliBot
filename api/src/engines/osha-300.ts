import { REPORT_SYSTEM_PROMPTS } from "../lib/prompts.js";
import { generateReportWithLLM, parseReportSections } from "../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../services/report-generator.js";

interface Osha300Entry {
  caseNumber: string;
  employeeName: string;
  jobTitle: string;
  dateOfInjury: string;
  whereOccurred: string;
  descriptionOfInjury: string;
  classifyCase: {
    death: boolean;
    daysAway: boolean;
    restrictedTransfer: boolean;
    otherRecordable: boolean;
  };
  daysAwayFromWork: number;
  daysOfRestrictedActivity: number;
  injuryType: "injury" | "skin_disorder" | "respiratory" | "poisoning" | "hearing_loss" | "other_illness";
}

export async function generateOsha300Report(input: ReportGenerationInput): Promise<GeneratedReport> {
  const entries = buildOsha300Entries(input);
  const summary = calculateOsha300Summary(entries, input.employeeCount);

  const additionalContext = `
OSHA 300 LOG ENTRIES (structured):
${formatOsha300Entries(entries)}

SUMMARY STATISTICS:
- Total Cases: ${summary.totalCases}
- Deaths: ${summary.deaths}
- Days Away From Work Cases: ${summary.daysAwayCases}
- Job Transfer/Restriction Cases: ${summary.restrictedCases}
- Other Recordable Cases: ${summary.otherRecordable}
- Total Days Away: ${summary.totalDaysAway}
- Total Days Restricted: ${summary.totalDaysRestricted}
- Injuries: ${summary.injuries}
- Skin Disorders: ${summary.skinDisorders}
- Respiratory Conditions: ${summary.respiratoryConditions}
- Poisonings: ${summary.poisonings}
- Hearing Loss Cases: ${summary.hearingLoss}
- Other Illnesses: ${summary.otherIllnesses}
- Total Hours Worked (estimated): ${summary.estimatedHoursWorked}
- DART Rate: ${summary.dartRate.toFixed(2)}
- TRIR: ${summary.trir.toFixed(2)}

Generate a complete OSHA 300 Log report including:
1. Cover page with establishment information
2. The complete log with all entries in tabular format
3. OSHA 300A Annual Summary section
4. Analysis of trends and patterns
5. Regulatory compliance assessment
6. Recommendations for injury prevention`;

  const rawContent = await generateReportWithLLM(
    input,
    REPORT_SYSTEM_PROMPTS.OSHA_300,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = identifyOsha300Gaps(entries, input);

  return {
    title: `OSHA 300 Log — ${input.facilityName} — ${input.dateRangeStart} to ${input.dateRangeEnd}`,
    summary: `OSHA Form 300 Log of Work-Related Injuries and Illnesses for reporting period ${input.dateRangeStart} through ${input.dateRangeEnd}. Total recordable cases: ${summary.totalCases}. TRIR: ${summary.trir.toFixed(2)}. DART Rate: ${summary.dartRate.toFixed(2)}.`,
    complianceScore: calculateOsha300ComplianceScore(gaps),
    sections,
    gaps,
  };
}

function buildOsha300Entries(input: ReportGenerationInput): Osha300Entry[] {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const entries: Osha300Entry[] = [];

  for (const [index, record] of records.entries()) {
    entries.push({
      caseNumber: `${input.facilityName.slice(0, 3).toUpperCase()}-${input.dateRangeStart.slice(0, 4)}-${String(index + 1).padStart(3, "0")}`,
      employeeName: "[Employee Name Redacted]",
      jobTitle: String(record["jobTitle"] ?? record["employeeJobTitle"] ?? "Not Specified"),
      dateOfInjury: String(record["date"] ?? record["dateOfInjury"] ?? ""),
      whereOccurred: String(record["location"] ?? record["whereOccurred"] ?? ""),
      descriptionOfInjury: String(record["description"] ?? record["descriptionOfInjury"] ?? ""),
      classifyCase: {
        death: record["outcome"] === "death",
        daysAway: record["outcome"] === "days_away",
        restrictedTransfer: record["outcome"] === "restricted_transfer",
        otherRecordable: record["outcome"] === "other_recordable",
      },
      daysAwayFromWork: Number(record["daysAway"] ?? 0),
      daysOfRestrictedActivity: Number(record["daysRestricted"] ?? 0),
      injuryType: mapInjuryType(String(record["injuryType"] ?? "injury")),
    });
  }

  return entries;
}

function mapInjuryType(type: string): Osha300Entry["injuryType"] {
  const typeMap: Record<string, Osha300Entry["injuryType"]> = {
    injury: "injury",
    skin_disorder: "skin_disorder",
    skin: "skin_disorder",
    respiratory: "respiratory",
    poisoning: "poisoning",
    hearing_loss: "hearing_loss",
    hearing: "hearing_loss",
    other_illness: "other_illness",
    illness: "other_illness",
  };
  return typeMap[type.toLowerCase()] ?? "injury";
}

function calculateOsha300Summary(entries: Osha300Entry[], employeeCount: number) {
  const totalCases = entries.length;
  const deaths = entries.filter((e) => e.classifyCase.death).length;
  const daysAwayCases = entries.filter((e) => e.classifyCase.daysAway).length;
  const restrictedCases = entries.filter((e) => e.classifyCase.restrictedTransfer).length;
  const otherRecordable = entries.filter((e) => e.classifyCase.otherRecordable).length;
  const totalDaysAway = entries.reduce((sum, e) => sum + e.daysAwayFromWork, 0);
  const totalDaysRestricted = entries.reduce((sum, e) => sum + e.daysOfRestrictedActivity, 0);

  const injuries = entries.filter((e) => e.injuryType === "injury").length;
  const skinDisorders = entries.filter((e) => e.injuryType === "skin_disorder").length;
  const respiratoryConditions = entries.filter((e) => e.injuryType === "respiratory").length;
  const poisonings = entries.filter((e) => e.injuryType === "poisoning").length;
  const hearingLoss = entries.filter((e) => e.injuryType === "hearing_loss").length;
  const otherIllnesses = entries.filter((e) => e.injuryType === "other_illness").length;

  // Estimate hours worked: employees * 2080 hours/year (standard)
  const estimatedHoursWorked = employeeCount * 2080;

  // TRIR = (Total Recordable Cases * 200,000) / Total Hours Worked
  const trir = estimatedHoursWorked > 0 ? (totalCases * 200000) / estimatedHoursWorked : 0;

  // DART = ((Days Away + Restricted/Transfer Cases) * 200,000) / Total Hours Worked
  const dartCases = daysAwayCases + restrictedCases;
  const dartRate = estimatedHoursWorked > 0 ? (dartCases * 200000) / estimatedHoursWorked : 0;

  return {
    totalCases,
    deaths,
    daysAwayCases,
    restrictedCases,
    otherRecordable,
    totalDaysAway,
    totalDaysRestricted,
    injuries,
    skinDisorders,
    respiratoryConditions,
    poisonings,
    hearingLoss,
    otherIllnesses,
    estimatedHoursWorked,
    trir,
    dartRate,
  };
}

function formatOsha300Entries(entries: Osha300Entry[]): string {
  return entries
    .map(
      (e) =>
        `Case ${e.caseNumber}: ${e.dateOfInjury} | ${e.jobTitle} | ${e.whereOccurred} | ${e.descriptionOfInjury} | Type: ${e.injuryType} | Days Away: ${e.daysAwayFromWork} | Days Restricted: ${e.daysOfRestrictedActivity}`
    )
    .join("\n");
}

function identifyOsha300Gaps(entries: Osha300Entry[], input: ReportGenerationInput): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  // Check for missing data in entries
  const missingDateEntries = entries.filter((e) => !e.dateOfInjury);
  if (missingDateEntries.length > 0) {
    gaps.push({
      standard: "29 CFR 1904.29",
      requirement: "OSHA 300 Log entries must include the date of injury or illness onset",
      currentState: `${missingDateEntries.length} entries are missing date of injury/illness`,
      severity: "high",
      recommendedAction: "Review incident reports and update OSHA 300 Log with accurate dates for all entries",
    });
  }

  const missingLocationEntries = entries.filter((e) => !e.whereOccurred || e.whereOccurred === "Not Specified");
  if (missingLocationEntries.length > 0) {
    gaps.push({
      standard: "29 CFR 1904.29",
      requirement: "Log must describe where the event occurred (department, work area)",
      currentState: `${missingLocationEntries.length} entries have incomplete location information`,
      severity: "medium",
      recommendedAction: "Update entries with specific location data (building, floor, department, work area)",
    });
  }

  const missingDescriptionEntries = entries.filter((e) => !e.descriptionOfInjury);
  if (missingDescriptionEntries.length > 0) {
    gaps.push({
      standard: "29 CFR 1904.29",
      requirement: "Describe injury/illness, parts of body affected, and object/substance that directly injured the employee",
      currentState: `${missingDescriptionEntries.length} entries lack adequate injury description`,
      severity: "high",
      recommendedAction: "Interview affected employees and supervisors to complete injury descriptions per OSHA requirements",
    });
  }

  // Check recording timeliness (if records have metadata about recording dates)
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const lateRecords = records.filter((r) => {
    const daysSinceIncident = Number(r["daysSinceRecorded"] ?? 0);
    return daysSinceIncident > 7;
  });

  if (lateRecords.length > 0) {
    gaps.push({
      standard: "29 CFR 1904.7",
      requirement: "Employers must record injuries within 7 calendar days of receiving information that a recordable case occurred",
      currentState: `${lateRecords.length} cases were recorded more than 7 days after the employer received information`,
      severity: "high",
      recommendedAction: "Implement automated notification system to alert safety manager within 24 hours of incident; establish 48-hour recording deadline with escalation",
    });
  }

  return gaps;
}

function calculateOsha300ComplianceScore(gaps: GeneratedGap[]): number {
  let score = 100;
  for (const gap of gaps) {
    switch (gap.severity) {
      case "critical":
        score -= 25;
        break;
      case "high":
        score -= 15;
        break;
      case "medium":
        score -= 8;
        break;
      case "low":
        score -= 3;
        break;
      case "informational":
        score -= 1;
        break;
    }
  }
  return Math.max(0, Math.min(100, score));
}
