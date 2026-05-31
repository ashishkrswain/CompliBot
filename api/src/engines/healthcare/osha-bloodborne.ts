import { generateReportWithLLM, parseReportSections } from "../../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../../services/report-generator.js";

const OSHA_BLOODBORNE_SYSTEM_PROMPT = `You are an expert OSHA compliance officer generating a complete Exposure Control Plan (ECP) per 29 CFR 1910.1030 — Bloodborne Pathogens Standard.

The ECP must comply with all requirements of 29 CFR 1910.1030 and include:

1. EXPOSURE DETERMINATION (§1910.1030(c)(2)):
   - List of all job classifications with occupational exposure
   - List of tasks and procedures in which exposure occurs
   - Category A: All employees in classification have occupational exposure
   - Category B: Some employees in classification have occupational exposure (list tasks)

2. METHODS OF COMPLIANCE (§1910.1030(d)):
   - Universal precautions (§1910.1030(d)(1))
   - Engineering controls (§1910.1030(d)(2)(i)) — safety-engineered sharps, sharps containers, etc.
   - Work practice controls (§1910.1030(d)(2)(iv))
   - Personal protective equipment (§1910.1030(d)(3))
   - Housekeeping (§1910.1030(d)(4))

3. HEPATITIS B VACCINATION (§1910.1030(f)):
   - Offered within 10 working days of initial assignment
   - At no cost to employee
   - Declination form requirements
   - Post-exposure prophylaxis

4. POST-EXPOSURE EVALUATION AND FOLLOW-UP (§1910.1030(f)):
   - Immediate actions (wash, flush, report)
   - Documentation of route of exposure and circumstances
   - Source individual identification and testing (if consent obtained)
   - Exposed employee testing and counseling
   - Healthcare professional's written opinion
   - Confidentiality requirements

5. COMMUNICATION OF HAZARDS (§1910.1030(g)):
   - Labels and signs (biohazard symbol)
   - Employee training (initial and annual)
   - Training content requirements (13 elements per §1910.1030(g)(2)(vii))
   - Accessibility of standard and ECP

6. RECORDKEEPING (§1910.1030(h)):
   - Medical records (per 29 CFR 1910.1020) — maintain for duration of employment + 30 years
   - Training records — maintain for 3 years
   - Sharps injury log — maintain for 5 years (§1910.1030(h)(5))

7. ANNUAL REVIEW AND UPDATE:
   - Annual review of ECP per §1910.1030(c)(1)(iv)
   - Documentation of consideration and use of safer medical devices (Needlestick Safety Act)
   - Non-managerial employee input on device selection

Generate a complete, facility-specific Exposure Control Plan with all required elements. Use proper OSHA section numbers throughout.`;

interface BloodborneInput {
  facilityType: string;
  jobTitles: string[];
  proceduresPerformed: string[];
  exposureRiskLevel: "high" | "medium" | "low";
  employeeCount: number;
}

interface ExposureClassification {
  jobTitle: string;
  category: "A" | "B";
  tasks: string[];
  riskLevel: "high" | "medium" | "low";
}

export async function generateOshaBloodborneReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const bloodborneInput = extractBloodborneInput(input);
  const exposureClassifications = buildExposureClassifications(bloodborneInput);

  const additionalContext = buildBloodborneContext(bloodborneInput, exposureClassifications);

  const rawContent = await generateReportWithLLM(
    input,
    OSHA_BLOODBORNE_SYSTEM_PROMPT,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = identifyBloodborneGaps(bloodborneInput, exposureClassifications);

  return {
    title: `Exposure Control Plan (Bloodborne Pathogens) — ${input.facilityName}`,
    summary: `Exposure Control Plan per 29 CFR 1910.1030 for ${input.facilityName} (${bloodborneInput.facilityType}). ${exposureClassifications.length} job classifications assessed. Category A (all employees exposed): ${exposureClassifications.filter((c) => c.category === "A").length} classifications. Category B (some employees exposed): ${exposureClassifications.filter((c) => c.category === "B").length} classifications. Overall exposure risk level: ${bloodborneInput.exposureRiskLevel}.`,
    complianceScore: calculateBloodborneComplianceScore(gaps),
    sections,
    gaps,
  };
}

function extractBloodborneInput(input: ReportGenerationInput): BloodborneInput {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const operationalData = input.operationalData;

  const jobTitles: string[] = [];
  const proceduresPerformed: string[] = [];
  let exposureRiskLevel: "high" | "medium" | "low" = "medium";

  for (const record of records) {
    if (record["jobTitle"] && typeof record["jobTitle"] === "string") {
      jobTitles.push(record["jobTitle"]);
    }
    if (record["procedure"] && typeof record["procedure"] === "string") {
      proceduresPerformed.push(record["procedure"]);
    }
    if (record["exposureRisk"] && typeof record["exposureRisk"] === "string") {
      const risk = record["exposureRisk"].toLowerCase();
      if (risk === "high" || risk === "medium" || risk === "low") {
        exposureRiskLevel = risk;
      }
    }
  }

  // Parse from operational data
  const jobMatches = operationalData.match(/(?:job title|position|role)[:\s]+([^\n,]+)/gi);
  if (jobMatches && jobTitles.length === 0) {
    jobTitles.push(...jobMatches.map((m) => m.replace(/^[^:]+:\s*/, "").trim()));
  }

  const procMatches = operationalData.match(/(?:procedure|task|service)[:\s]+([^\n,]+)/gi);
  if (procMatches && proceduresPerformed.length === 0) {
    proceduresPerformed.push(...procMatches.map((m) => m.replace(/^[^:]+:\s*/, "").trim()));
  }

  // Default job titles based on facility type
  if (jobTitles.length === 0) {
    jobTitles.push(...getDefaultJobTitles(input.facilityType));
  }

  // Default procedures based on facility type
  if (proceduresPerformed.length === 0) {
    proceduresPerformed.push(...getDefaultProcedures(input.facilityType));
  }

  // Determine risk level from facility type
  const facilityLower = input.facilityType.toLowerCase();
  if (facilityLower.includes("hospital") || facilityLower.includes("emergency") || facilityLower.includes("surgery")) {
    exposureRiskLevel = "high";
  } else if (facilityLower.includes("clinic") || facilityLower.includes("dental") || facilityLower.includes("lab")) {
    exposureRiskLevel = "medium";
  }

  return {
    facilityType: input.facilityType,
    jobTitles,
    proceduresPerformed,
    exposureRiskLevel,
    employeeCount: input.employeeCount,
  };
}

function getDefaultJobTitles(facilityType: string): string[] {
  const lower = facilityType.toLowerCase();

  if (lower.includes("hospital")) {
    return [
      "Physician", "Registered Nurse", "Licensed Practical Nurse", "Nursing Assistant",
      "Phlebotomist", "Lab Technician", "Surgical Technician", "Respiratory Therapist",
      "Emergency Medical Technician", "Housekeeping Staff", "Laundry Staff",
      "Maintenance Worker", "Security Officer",
    ];
  }
  if (lower.includes("dental")) {
    return [
      "Dentist", "Dental Hygienist", "Dental Assistant", "Oral Surgeon",
      "Front Office Staff", "Sterilization Technician",
    ];
  }
  if (lower.includes("clinic")) {
    return [
      "Physician", "Physician Assistant", "Nurse Practitioner", "Registered Nurse",
      "Medical Assistant", "Phlebotomist", "Lab Technician", "Front Office Staff",
      "Housekeeping Staff",
    ];
  }
  if (lower.includes("lab")) {
    return [
      "Lab Director", "Medical Technologist", "Lab Technician", "Phlebotomist",
      "Specimen Processor", "Housekeeping Staff",
    ];
  }
  if (lower.includes("home health")) {
    return [
      "Registered Nurse", "Licensed Practical Nurse", "Home Health Aide",
      "Physical Therapist", "Occupational Therapist",
    ];
  }

  return [
    "Physician", "Nurse", "Medical Assistant", "Lab Technician",
    "Housekeeping Staff", "Administrative Staff",
  ];
}

function getDefaultProcedures(facilityType: string): string[] {
  const lower = facilityType.toLowerCase();

  if (lower.includes("hospital")) {
    return [
      "Venipuncture/phlebotomy", "IV insertion and removal", "Wound care and dressing changes",
      "Surgical procedures", "Injection administration", "Blood glucose monitoring",
      "Suctioning", "Catheter insertion", "Specimen collection and handling",
      "Sharps disposal", "Linen handling", "Waste disposal",
    ];
  }
  if (lower.includes("dental")) {
    return [
      "Scaling and root planing", "Tooth extraction", "Surgical procedures",
      "Injection of local anesthetic", "Instrument processing/sterilization",
      "Intraoral radiographs", "Impression taking", "Polishing and prophylaxis",
      "Periodontal probing",
    ];
  }
  if (lower.includes("clinic")) {
    return [
      "Venipuncture/phlebotomy", "Injection administration", "Wound care",
      "Blood glucose monitoring", "Specimen collection", "Minor procedures",
      "IV therapy", "Suturing",
    ];
  }

  return [
    "Venipuncture/phlebotomy", "Injection administration", "Wound care",
    "Specimen handling", "Sharps disposal", "Equipment cleaning",
  ];
}

function buildExposureClassifications(bloodborneInput: BloodborneInput): ExposureClassification[] {
  const classifications: ExposureClassification[] = [];

  for (const jobTitle of bloodborneInput.jobTitles) {
    const classification = classifyJobTitle(jobTitle, bloodborneInput);
    classifications.push(classification);
  }

  return classifications;
}

function classifyJobTitle(jobTitle: string, bloodborneInput: BloodborneInput): ExposureClassification {
  const lower = jobTitle.toLowerCase();

  // Category A: All employees have occupational exposure
  const categoryATitles = [
    "physician", "surgeon", "nurse", "lpn", "rn", "np", "pa",
    "phlebotomist", "lab tech", "medical technologist",
    "dental hygienist", "dentist", "dental assistant",
    "surgical tech", "respiratory therapist", "emt", "paramedic",
    "home health aide", "nursing assistant", "cna",
  ];

  const isCategaryA = categoryATitles.some((t) => lower.includes(t));

  // Determine tasks based on job title
  const tasks = getTasksForTitle(jobTitle, bloodborneInput.proceduresPerformed);

  // Risk level
  let riskLevel: "high" | "medium" | "low" = "medium";
  if (lower.includes("surgeon") || lower.includes("emergency") || lower.includes("phlebotomist")) {
    riskLevel = "high";
  } else if (lower.includes("admin") || lower.includes("front office") || lower.includes("reception")) {
    riskLevel = "low";
  }

  return {
    jobTitle,
    category: isCategaryA ? "A" : "B",
    tasks,
    riskLevel,
  };
}

function getTasksForTitle(jobTitle: string, allProcedures: string[]): string[] {
  const lower = jobTitle.toLowerCase();

  if (lower.includes("physician") || lower.includes("surgeon")) {
    return allProcedures.filter((p) =>
      p.toLowerCase().includes("surgi") || p.toLowerCase().includes("procedure") ||
      p.toLowerCase().includes("injection") || p.toLowerCase().includes("wound") ||
      p.toLowerCase().includes("sutur")
    );
  }
  if (lower.includes("nurse") || lower.includes("rn") || lower.includes("lpn")) {
    return allProcedures.filter((p) =>
      p.toLowerCase().includes("venipuncture") || p.toLowerCase().includes("iv") ||
      p.toLowerCase().includes("injection") || p.toLowerCase().includes("wound") ||
      p.toLowerCase().includes("blood") || p.toLowerCase().includes("catheter") ||
      p.toLowerCase().includes("specimen")
    );
  }
  if (lower.includes("phlebotomist")) {
    return allProcedures.filter((p) =>
      p.toLowerCase().includes("venipuncture") || p.toLowerCase().includes("blood") ||
      p.toLowerCase().includes("specimen")
    );
  }
  if (lower.includes("housekeeping") || lower.includes("laundry")) {
    return ["Handling contaminated linen", "Cleaning blood/body fluid spills", "Waste disposal", "Sharps container replacement"];
  }
  if (lower.includes("admin") || lower.includes("front office")) {
    return ["Occasional first aid response", "Handling contaminated items brought to front desk"];
  }

  return allProcedures.slice(0, 3);
}

function buildBloodborneContext(
  bloodborneInput: BloodborneInput,
  exposureClassifications: ExposureClassification[]
): string {
  const categoryA = exposureClassifications.filter((c) => c.category === "A");
  const categoryB = exposureClassifications.filter((c) => c.category === "B");

  return `
FACILITY INFORMATION:
- Type: ${bloodborneInput.facilityType}
- Employee Count: ${bloodborneInput.employeeCount}
- Overall Exposure Risk Level: ${bloodborneInput.exposureRiskLevel.toUpperCase()}

EXPOSURE DETERMINATION:

Category A — All employees in these classifications have occupational exposure:
${categoryA.map((c) => `  - ${c.jobTitle} (Risk: ${c.riskLevel})\n    Tasks: ${c.tasks.join("; ")}`).join("\n")}

Category B — Some employees in these classifications have occupational exposure:
${categoryB.map((c) => `  - ${c.jobTitle} (Risk: ${c.riskLevel})\n    Tasks: ${c.tasks.join("; ")}`).join("\n")}

PROCEDURES PERFORMED AT FACILITY:
${bloodborneInput.proceduresPerformed.map((p) => `  - ${p}`).join("\n")}

REQUIRED ECP SECTIONS:

1. PURPOSE AND SCOPE
2. EXPOSURE DETERMINATION (§1910.1030(c)(2))
   - Job classifications with exposure (Category A and B)
   - Tasks and procedures causing exposure
3. METHODS OF COMPLIANCE (§1910.1030(d))
   - Universal/Standard Precautions
   - Engineering Controls (safety-engineered sharps devices, sharps containers)
   - Work Practice Controls (hand hygiene, safe needle practices)
   - PPE (gloves, gowns, eye protection, face shields, masks)
   - Housekeeping (decontamination schedules, regulated waste disposal)
4. HEPATITIS B VACCINATION PROGRAM (§1910.1030(f))
   - Offer within 10 working days of assignment
   - No-cost provision
   - Declination statement
   - Post-exposure prophylaxis
5. POST-EXPOSURE EVALUATION AND FOLLOW-UP (§1910.1030(f))
   - Immediate response protocol
   - Documentation requirements
   - Source patient testing
   - Exposed employee evaluation
   - Healthcare provider written opinion
   - Confidentiality
6. COMMUNICATION OF HAZARDS (§1910.1030(g))
   - Biohazard labeling/signs
   - Training requirements (initial + annual)
   - Training content (all 13 elements per §1910.1030(g)(2)(vii))
7. RECORDKEEPING (§1910.1030(h))
   - Medical records (employment + 30 years)
   - Training records (3 years)
   - Sharps injury log (5 years)
8. ANNUAL REVIEW AND UPDATE
   - Needlestick Safety and Prevention Act compliance
   - Safer medical device evaluation
   - Non-managerial employee input documentation

Generate the COMPLETE Exposure Control Plan with all sections fully developed, including specific procedures, forms references, and regulatory citations throughout.`;
}

function identifyBloodborneGaps(
  bloodborneInput: BloodborneInput,
  classifications: ExposureClassification[]
): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  // Annual review requirement
  gaps.push({
    standard: "29 CFR 1910.1030(c)(1)(iv)",
    requirement: "Exposure Control Plan must be reviewed and updated at least annually",
    currentState: "ECP has been generated; annual review schedule must be established and documented",
    severity: "medium",
    recommendedAction: "Establish annual ECP review process; document review dates and changes; include consideration of new safer medical devices per Needlestick Safety and Prevention Act",
  });

  // Training gaps
  const highRiskCount = classifications.filter((c) => c.riskLevel === "high").length;
  if (highRiskCount > 0) {
    gaps.push({
      standard: "29 CFR 1910.1030(g)(2)",
      requirement: "Training must be provided at time of initial assignment and at least annually thereafter",
      currentState: `${highRiskCount} high-risk job classifications identified; training compliance must be verified`,
      severity: "high",
      recommendedAction: "Verify all employees in high-risk classifications have current BBP training (within past 12 months); schedule training for any gaps; document all training with dates, content, and trainer qualifications",
    });
  }

  // Hep B vaccination
  gaps.push({
    standard: "29 CFR 1910.1030(f)(2)",
    requirement: "Hepatitis B vaccination must be offered within 10 working days of initial assignment to all employees with occupational exposure",
    currentState: "Vaccination program compliance must be verified for all employees with occupational exposure",
    severity: "high",
    recommendedAction: "Audit vaccination records for all employees with occupational exposure; offer vaccination to any employee not yet vaccinated; obtain signed declination forms from those who refuse; document all offers and outcomes",
  });

  // Sharps injury log
  gaps.push({
    standard: "29 CFR 1910.1030(h)(5)",
    requirement: "Maintain sharps injury log with type/brand of device, department, and explanation of how incident occurred",
    currentState: "Sharps injury log must be established and maintained (required for facilities with 11+ employees)",
    severity: bloodborneInput.employeeCount >= 11 ? "medium" : "low",
    recommendedAction: "Establish sharps injury log per §1910.1030(h)(5); include device type and brand, department/work area, and explanation of incident; maintain for 5 years; review during annual ECP update",
  });

  // Engineering controls review
  if (bloodborneInput.exposureRiskLevel === "high") {
    gaps.push({
      standard: "29 CFR 1910.1030(d)(2)(i)",
      requirement: "Engineering controls shall be examined and maintained or replaced on a regular schedule to ensure their effectiveness",
      currentState: "High-risk facility requires robust engineering controls program with regular assessment",
      severity: "high",
      recommendedAction: "Conduct immediate inventory of all engineering controls (safety-engineered sharps devices, sharps disposal containers, self-sheathing needles); document evaluation of newer/safer devices; solicit frontline employee input per Needlestick Safety Act",
    });
  }

  // PPE assessment
  gaps.push({
    standard: "29 CFR 1910.1030(d)(3)(i)",
    requirement: "Appropriate PPE must be provided at no cost, in appropriate sizes, and readily accessible",
    currentState: "PPE adequacy and availability must be assessed for all exposure tasks",
    severity: "medium",
    recommendedAction: "Audit PPE availability by location and size; verify appropriate PPE for each exposure task (gloves, gowns, masks, eye protection); ensure hypoallergenic alternatives available; document assessment",
  });

  return gaps;
}

function calculateBloodborneComplianceScore(gaps: GeneratedGap[]): number {
  let score = 100;
  for (const gap of gaps) {
    switch (gap.severity) {
      case "critical":
        score -= 25;
        break;
      case "high":
        score -= 12;
        break;
      case "medium":
        score -= 6;
        break;
      case "low":
        score -= 2;
        break;
    }
  }
  return Math.max(0, Math.min(100, score));
}
