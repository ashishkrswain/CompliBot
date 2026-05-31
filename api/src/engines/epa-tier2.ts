import { REPORT_SYSTEM_PROMPTS } from "../lib/prompts.js";
import { generateReportWithLLM, parseReportSections } from "../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../services/report-generator.js";

interface Tier2Chemical {
  chemicalName: string;
  casNumber: string;
  ehs: boolean;
  physicalHazards: string[];
  healthHazards: string[];
  maxAmountCode: string;
  maxAmountLbs: number;
  avgDailyAmountCode: string;
  avgDailyAmountLbs: number;
  daysOnSite: number;
  storageLocations: Array<{
    description: string;
    storageType: string;
    pressure: "ambient" | "above_ambient" | "below_ambient";
    temperature: "ambient" | "above_ambient" | "below_ambient" | "cryogenic";
  }>;
}

const AMOUNT_RANGE_CODES: Record<string, string> = {
  "01": "0-99 lbs",
  "02": "100-999 lbs",
  "03": "1,000-9,999 lbs",
  "04": "10,000-99,999 lbs",
  "05": "100,000-999,999 lbs",
  "06": "1,000,000-9,999,999 lbs",
  "07": "10,000,000-49,999,999 lbs",
};

export async function generateEpaTier2Report(input: ReportGenerationInput): Promise<GeneratedReport> {
  const chemicals = buildTier2ChemicalInventory(input);
  const reportableChemicals = chemicals.filter(isReportable);

  const additionalContext = `
CHEMICAL INVENTORY (Tier II Reportable):
${formatChemicalInventory(reportableChemicals)}

TOTAL REPORTABLE CHEMICALS: ${reportableChemicals.length}
EHS CHEMICALS: ${reportableChemicals.filter((c) => c.ehs).length}
NON-EHS ABOVE 10,000 LBS: ${reportableChemicals.filter((c) => !c.ehs && c.maxAmountLbs >= 10000).length}

FACILITY SUBMISSION REQUIREMENTS:
- Submit to State Emergency Response Commission (SERC)
- Submit to Local Emergency Planning Committee (LEPC)
- Submit to local fire department with jurisdiction
- Annual deadline: March 1

Generate a complete EPA Tier II report including:
1. Facility identification section
2. Emergency contact information
3. Chemical inventory with all required fields per 40 CFR 370.40
4. Storage location details
5. Hazard classification for each chemical
6. Certification statement
7. Compliance assessment and any gaps identified`;

  const rawContent = await generateReportWithLLM(
    input,
    REPORT_SYSTEM_PROMPTS.EPA_TIER2,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = identifyTier2Gaps(chemicals, reportableChemicals, input);

  return {
    title: `EPA Tier II Hazardous Chemical Inventory — ${input.facilityName} — CY ${input.dateRangeStart.slice(0, 4)}`,
    summary: `Emergency Planning and Community Right-to-Know Act (EPCRA) Section 312 Tier II Report for calendar year ${input.dateRangeStart.slice(0, 4)}. ${reportableChemicals.length} reportable chemicals identified. ${reportableChemicals.filter((c) => c.ehs).length} Extremely Hazardous Substances (EHS) present above threshold planning quantities.`,
    complianceScore: calculateTier2ComplianceScore(gaps),
    sections,
    gaps,
  };
}

function buildTier2ChemicalInventory(input: ReportGenerationInput): Tier2Chemical[] {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const chemicals: Tier2Chemical[] = [];

  for (const record of records) {
    const maxLbs = Number(record["quantity"] ?? record["maxAmount"] ?? 0);
    const avgLbs = Number(record["avgDailyAmount"] ?? maxLbs * 0.6);

    chemicals.push({
      chemicalName: String(record["chemicalName"] ?? "Unknown Chemical"),
      casNumber: String(record["casNumber"] ?? "N/A"),
      ehs: Boolean(record["ehs"] ?? false),
      physicalHazards: (record["physicalHazards"] as string[]) ?? determinePhysicalHazards(record),
      healthHazards: (record["healthHazards"] as string[]) ?? determineHealthHazards(record),
      maxAmountCode: getAmountRangeCode(maxLbs),
      maxAmountLbs: maxLbs,
      avgDailyAmountCode: getAmountRangeCode(avgLbs),
      avgDailyAmountLbs: avgLbs,
      daysOnSite: Number(record["daysOnSite"] ?? 365),
      storageLocations: buildStorageLocations(record),
    });
  }

  return chemicals;
}

function isReportable(chemical: Tier2Chemical): boolean {
  // EHS chemicals: reportable above TPQ (varies per chemical, use presence as proxy)
  if (chemical.ehs) return true;
  // All other hazardous chemicals: reportable above 10,000 lbs
  return chemical.maxAmountLbs >= 10000;
}

function getAmountRangeCode(lbs: number): string {
  if (lbs < 100) return "01";
  if (lbs < 1000) return "02";
  if (lbs < 10000) return "03";
  if (lbs < 100000) return "04";
  if (lbs < 1000000) return "05";
  if (lbs < 10000000) return "06";
  return "07";
}

function determinePhysicalHazards(record: Record<string, unknown>): string[] {
  const hazards: string[] = [];
  const classes = String(record["hazardClasses"] ?? "").toLowerCase();
  if (classes.includes("flammable")) hazards.push("Flammable (solid, liquid, or gas)");
  if (classes.includes("oxidizer")) hazards.push("Oxidizer (solid or liquid)");
  if (classes.includes("compressed") || classes.includes("gas")) hazards.push("Gas under pressure");
  if (classes.includes("explosive")) hazards.push("Explosive");
  if (classes.includes("corrosive") && classes.includes("metal")) hazards.push("Corrosive to metals");
  if (hazards.length === 0) hazards.push("Hazard Not Otherwise Classified");
  return hazards;
}

function determineHealthHazards(record: Record<string, unknown>): string[] {
  const hazards: string[] = [];
  const classes = String(record["hazardClasses"] ?? "").toLowerCase();
  if (classes.includes("toxic") || classes.includes("acute")) hazards.push("Acute toxicity (any route of exposure)");
  if (classes.includes("carcinogen")) hazards.push("Carcinogenicity");
  if (classes.includes("irritant")) hazards.push("Skin corrosion or irritation");
  if (classes.includes("sensitiz")) hazards.push("Respiratory or skin sensitization");
  if (hazards.length === 0) hazards.push("Acute toxicity (any route of exposure)");
  return hazards;
}

function buildStorageLocations(record: Record<string, unknown>): Tier2Chemical["storageLocations"] {
  const location = String(record["location"] ?? record["storageLocation"] ?? "Main Facility");
  const storageType = String(record["storageType"] ?? "Steel drum");

  return [
    {
      description: location,
      storageType,
      pressure: (record["storagePressure"] as "ambient" | "above_ambient" | "below_ambient") ?? "ambient",
      temperature: (record["storageTemperature"] as "ambient" | "above_ambient" | "below_ambient" | "cryogenic") ?? "ambient",
    },
  ];
}

function formatChemicalInventory(chemicals: Tier2Chemical[]): string {
  return chemicals
    .map((c) => {
      const rangeDesc = AMOUNT_RANGE_CODES[c.maxAmountCode] ?? "Unknown";
      return `${c.chemicalName} (CAS: ${c.casNumber})${c.ehs ? " [EHS]" : ""}
  Max Amount: ${rangeDesc} (Code ${c.maxAmountCode})
  Avg Daily: ${AMOUNT_RANGE_CODES[c.avgDailyAmountCode] ?? "Unknown"} (Code ${c.avgDailyAmountCode})
  Days On Site: ${c.daysOnSite}
  Physical Hazards: ${c.physicalHazards.join(", ")}
  Health Hazards: ${c.healthHazards.join(", ")}
  Storage: ${c.storageLocations.map((l) => `${l.description} (${l.storageType}, ${l.pressure} pressure, ${l.temperature} temp)`).join("; ")}`;
    })
    .join("\n\n");
}

function identifyTier2Gaps(
  allChemicals: Tier2Chemical[],
  reportableChemicals: Tier2Chemical[],
  _input: ReportGenerationInput
): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  // Check for missing CAS numbers
  const missingCas = reportableChemicals.filter((c) => c.casNumber === "N/A" || !c.casNumber);
  if (missingCas.length > 0) {
    gaps.push({
      standard: "40 CFR 370.40",
      requirement: "Report CAS registry number for each hazardous chemical",
      currentState: `${missingCas.length} chemicals are missing CAS registry numbers`,
      severity: "high",
      recommendedAction: "Cross-reference Safety Data Sheets (SDS) to obtain CAS numbers for all reported chemicals",
    });
  }

  // Check for chemicals potentially below reporting threshold but EHS
  const potentialEHS = allChemicals.filter(
    (c) => !c.ehs && c.maxAmountLbs < 10000 && c.maxAmountLbs > 500
  );
  if (potentialEHS.length > 0) {
    gaps.push({
      standard: "40 CFR 370.20",
      requirement: "EHS chemicals above Threshold Planning Quantity must be reported regardless of 10,000 lb threshold",
      currentState: `${potentialEHS.length} chemicals between 500-10,000 lbs not flagged as EHS — verify against EPA EHS list`,
      severity: "medium",
      recommendedAction: "Cross-reference all chemicals against 40 CFR 355 Appendix A (EHS list) to confirm non-EHS status",
    });
  }

  // Check for incomplete storage information
  const incompleteStorage = reportableChemicals.filter(
    (c) => c.storageLocations.length === 0 || c.storageLocations.some((l) => l.description === "Main Facility")
  );
  if (incompleteStorage.length > 0) {
    gaps.push({
      standard: "40 CFR 370.40",
      requirement: "Report specific storage locations within the facility (building, room, area)",
      currentState: `${incompleteStorage.length} chemicals have non-specific storage location descriptions`,
      severity: "medium",
      recommendedAction: "Conduct physical inventory walk-through to document precise storage locations (building ID, room, rack/area designation)",
    });
  }

  return gaps;
}

function calculateTier2ComplianceScore(gaps: GeneratedGap[]): number {
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
