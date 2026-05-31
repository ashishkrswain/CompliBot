import { generateReportWithLLM, parseReportSections } from "../../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../../services/report-generator.js";

const COMPLIANCE_PROGRAM_SYSTEM_PROMPT = `You are an expert healthcare compliance attorney generating a complete OIG Compliance Program document per the Office of Inspector General (OIG) guidance for healthcare entities.

The Compliance Program must incorporate ALL SEVEN ELEMENTS of an effective compliance program as established by the Federal Sentencing Guidelines and OIG guidance:

1. WRITTEN STANDARDS OF CONDUCT AND POLICIES (Element 1)
   - Code of Conduct
   - Compliance policies and procedures
   - Standards of ethical behavior
   - Specific risk area policies (billing, coding, referrals, etc.)

2. COMPLIANCE OFFICER AND COMPLIANCE COMMITTEE (Element 2)
   - Chief Compliance Officer designation and qualifications
   - Compliance Committee composition and charter
   - Reporting structure (direct access to Board/CEO)
   - Authority and resources

3. TRAINING AND EDUCATION (Element 3)
   - General compliance training (all employees)
   - Specific compliance training (risk area-specific)
   - New hire training timeline
   - Annual refresher requirements
   - Board/leadership training
   - Training documentation requirements

4. COMMUNICATION LINES AND REPORTING (Element 4)
   - Compliance hotline/helpline (anonymous reporting)
   - Open-door policy
   - Written reporting procedures
   - Non-retaliation/non-intimidation policy
   - Regular compliance communications

5. INTERNAL MONITORING AND AUDITING (Element 5)
   - Audit plan (annual)
   - Claims audit procedures
   - Coding accuracy reviews
   - Focus area audits
   - External audit engagement criteria
   - Baseline assessment requirements

6. ENFORCEMENT AND DISCIPLINE (Element 6)
   - Consistent enforcement of standards
   - Progressive discipline policy
   - Compliance as performance evaluation element
   - Publicized disciplinary guidelines
   - Background checks and exclusion screening (OIG LEIE, SAM)

7. CORRECTIVE ACTION (Element 7)
   - Root cause analysis procedures
   - Corrective Action Plan development
   - Voluntary self-disclosure to OIG (OIG Self-Disclosure Protocol)
   - Overpayment identification and return (60-Day Rule per 42 U.S.C. 1320a-7k(d))
   - Monitoring of corrective actions
   - Lessons learned integration

Additional regulatory frameworks to reference:
- OIG Compliance Program Guidance for Individual and Small Group Physician Practices (2000)
- OIG Compliance Program Guidance for Hospitals (1998, supplemented 2005)
- OIG Compliance Program Guidance for Nursing Facilities (2000)
- OIG Compliance Program Guidance for Third-Party Billing Companies (1998)
- OIG Compliance Program Guidance for Home Health Agencies (1998)
- Anti-Kickback Statute (42 U.S.C. 1320a-7b(b))
- False Claims Act (31 U.S.C. 3729-3733)
- Stark Law / Physician Self-Referral (42 U.S.C. 1395nn)
- EMTALA (42 U.S.C. 1395dd) if hospital/ED
- 42 U.S.C. 1320a-7k(d) — 60-Day Overpayment Return Rule

Generate a comprehensive, organization-specific compliance program document suitable for regulatory review, board approval, and OIG audit.`;

interface ComplianceProgramInput {
  organizationType: string;
  organizationSize: "small" | "medium" | "large";
  servicesProvided: string[];
  employeeCount: number;
  participatesInFederalPrograms: boolean;
}

export async function generateComplianceProgramReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const programInput = extractComplianceProgramInput(input);
  const additionalContext = buildComplianceProgramContext(programInput);

  const rawContent = await generateReportWithLLM(
    input,
    COMPLIANCE_PROGRAM_SYSTEM_PROMPT,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = identifyComplianceProgramGaps(programInput);

  return {
    title: `OIG Compliance Program — ${input.facilityName}`,
    summary: `Healthcare Compliance Program per OIG Guidance for ${input.facilityName} (${programInput.organizationType}). Incorporates all seven elements of an effective compliance program. Addresses Anti-Kickback Statute, False Claims Act, Stark Law, and federal healthcare program requirements. ${programInput.employeeCount} workforce members covered. ${programInput.participatesInFederalPrograms ? "Organization participates in federal healthcare programs (Medicare/Medicaid)." : ""}`,
    complianceScore: calculateProgramComplianceScore(programInput),
    sections,
    gaps,
  };
}

function extractComplianceProgramInput(input: ReportGenerationInput): ComplianceProgramInput {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const operationalData = input.operationalData;

  const servicesProvided: string[] = [];
  let participatesInFederalPrograms = true; // Default: most healthcare entities do

  for (const record of records) {
    if (record["service"] && typeof record["service"] === "string") {
      servicesProvided.push(record["service"]);
    }
    if (record["federalPrograms"] === false) {
      participatesInFederalPrograms = false;
    }
  }

  // Parse services from operational data
  const serviceMatches = operationalData.match(/(?:service|specialty|department)[:\s]+([^\n,]+)/gi);
  if (serviceMatches && servicesProvided.length === 0) {
    servicesProvided.push(...serviceMatches.map((m) => m.replace(/^[^:]+:\s*/, "").trim()));
  }

  // Default services by facility type
  if (servicesProvided.length === 0) {
    servicesProvided.push(...getDefaultServices(input.facilityType));
  }

  // Determine organization size
  let organizationSize: "small" | "medium" | "large" = "medium";
  if (input.employeeCount <= 25) {
    organizationSize = "small";
  } else if (input.employeeCount >= 250) {
    organizationSize = "large";
  }

  // Check for federal program participation indicators
  const federalIndicators = ["medicare", "medicaid", "tricare", "champva", "federal"];
  if (federalIndicators.some((fi) => operationalData.toLowerCase().includes(fi))) {
    participatesInFederalPrograms = true;
  }

  return {
    organizationType: mapToOrgType(input.facilityType),
    organizationSize,
    servicesProvided,
    employeeCount: input.employeeCount,
    participatesInFederalPrograms,
  };
}

function mapToOrgType(facilityType: string): string {
  const lower = facilityType.toLowerCase();
  if (lower.includes("hospital")) return "Hospital";
  if (lower.includes("clinic") || lower.includes("physician") || lower.includes("practice")) return "Physician Practice";
  if (lower.includes("nursing") || lower.includes("snf") || lower.includes("long term")) return "Nursing Facility";
  if (lower.includes("home health")) return "Home Health Agency";
  if (lower.includes("dme")) return "DME Supplier";
  if (lower.includes("hospice")) return "Hospice";
  if (lower.includes("lab")) return "Clinical Laboratory";
  if (lower.includes("pharmacy")) return "Pharmacy";
  if (lower.includes("dental")) return "Dental Practice";
  if (lower.includes("behavioral") || lower.includes("mental")) return "Behavioral Health Provider";
  if (lower.includes("billing")) return "Third-Party Billing Company";
  return "Healthcare Provider";
}

function getDefaultServices(facilityType: string): string[] {
  const lower = facilityType.toLowerCase();

  if (lower.includes("hospital")) {
    return [
      "Inpatient medical/surgical services",
      "Emergency department services",
      "Outpatient clinic services",
      "Diagnostic imaging",
      "Laboratory services",
      "Pharmacy services",
      "Rehabilitation services",
      "Surgical services",
    ];
  }
  if (lower.includes("clinic") || lower.includes("practice")) {
    return [
      "Office visits (new and established patients)",
      "Preventive care services",
      "Chronic disease management",
      "Minor procedures",
      "Diagnostic testing",
      "Referral management",
    ];
  }
  if (lower.includes("nursing") || lower.includes("snf")) {
    return [
      "Skilled nursing care",
      "Physical therapy",
      "Occupational therapy",
      "Speech therapy",
      "Medication management",
      "Activities of daily living assistance",
    ];
  }
  if (lower.includes("home health")) {
    return [
      "Skilled nursing visits",
      "Physical therapy",
      "Occupational therapy",
      "Home health aide services",
      "Medical social services",
    ];
  }
  if (lower.includes("dental")) {
    return [
      "Preventive dentistry",
      "Restorative dentistry",
      "Oral surgery",
      "Periodontics",
      "Endodontics",
    ];
  }

  return [
    "Patient care services",
    "Diagnostic services",
    "Treatment services",
    "Preventive services",
  ];
}

function buildComplianceProgramContext(programInput: ComplianceProgramInput): string {
  const riskAreas = identifyRiskAreas(programInput);

  return `
ORGANIZATION INFORMATION:
- Type: ${programInput.organizationType}
- Size: ${programInput.organizationSize} (${programInput.employeeCount} employees)
- Federal Program Participation: ${programInput.participatesInFederalPrograms ? "Yes (Medicare/Medicaid)" : "No federal programs"}
- Services Provided:
${programInput.servicesProvided.map((s) => `  - ${s}`).join("\n")}

IDENTIFIED COMPLIANCE RISK AREAS:
${riskAreas.map((r) => `  - ${r}`).join("\n")}

APPLICABLE OIG GUIDANCE:
${getApplicableOIGGuidance(programInput.organizationType)}

COMPLIANCE PROGRAM STRUCTURE REQUIREMENTS:

The document must include the following complete sections:

SECTION 1: PROGRAM OVERVIEW AND AUTHORITY
- Mission statement
- Regulatory basis (OIG guidance, Federal Sentencing Guidelines)
- Board resolution/authorization
- Program scope and applicability

SECTION 2: CODE OF CONDUCT
- Ethical standards
- Compliance with laws and regulations
- Conflicts of interest
- Gifts and entertainment
- Confidentiality
- Non-retaliation for reporting
- Employee acknowledgment requirement

SECTION 3: COMPLIANCE OFFICER AND COMMITTEE
- CCO designation, qualifications, and authority
- Reporting structure (CEO/Board direct report)
- Compliance Committee membership and responsibilities
- Meeting frequency (minimum quarterly)
- Resources and budget

SECTION 4: POLICIES AND PROCEDURES
- Billing and coding compliance
- Medical necessity documentation
- Anti-Kickback Statute compliance
- Stark Law compliance (if applicable)
- EMTALA compliance (if hospital)
- Credit balance resolution
- Overpayment identification and return (60-day rule)
- Government investigation response
- Excluded individuals/entities screening

SECTION 5: TRAINING AND EDUCATION
- General compliance training (all employees, within 90 days of hire)
- Annual refresher training
- Specialized training by role (billing, coding, clinical, leadership)
- Board education (annual minimum)
- New regulation/policy training
- Training completion tracking and documentation

SECTION 6: COMMUNICATION AND REPORTING
- Compliance hotline (anonymous option)
- Written reporting procedures
- Investigation process
- Non-retaliation policy (per 42 U.S.C. 1320a-7k)
- Regular compliance newsletters/updates
- Annual compliance report to Board

SECTION 7: MONITORING AND AUDITING
- Annual audit work plan
- Claims/billing audits (monthly sample minimum)
- Coding accuracy reviews
- Exclusion screening (monthly OIG LEIE and SAM checks)
- Focus audits based on OIG Work Plan priorities
- External audit engagement criteria
- Metrics and reporting

SECTION 8: ENFORCEMENT AND DISCIPLINE
- Progressive discipline framework
- Mandatory reporting of compliance concerns
- Compliance as evaluation criterion
- Background check requirements
- Exclusion screening at hire and monthly
- Consistent application of sanctions

SECTION 9: CORRECTIVE ACTION AND RESPONSE
- Investigation procedures
- Root cause analysis methodology
- Corrective Action Plan template
- Overpayment refund procedures (60-day rule)
- OIG Self-Disclosure Protocol procedures
- Government investigation response plan
- Effectiveness monitoring

SECTION 10: PROGRAM EVALUATION AND REPORTING
- Annual program effectiveness assessment
- Board reporting requirements
- Continuous improvement process
- Benchmarking against industry standards

Generate the COMPLETE compliance program document with all sections fully developed.`;
}

function identifyRiskAreas(programInput: ComplianceProgramInput): string[] {
  const risks: string[] = [];

  // Universal healthcare compliance risks
  risks.push("Billing and coding accuracy (upcoding, unbundling, duplicate billing)");
  risks.push("Medical necessity documentation");
  risks.push("Anti-Kickback Statute violations (referral arrangements, remuneration)");

  if (programInput.participatesInFederalPrograms) {
    risks.push("False Claims Act liability (Medicare/Medicaid billing)");
    risks.push("Overpayment identification and timely return (60-Day Rule)");
    risks.push("Excluded individuals/entities (OIG LEIE/SAM screening)");
  }

  // Organization-specific risks
  const orgType = programInput.organizationType.toLowerCase();
  if (orgType.includes("hospital")) {
    risks.push("EMTALA compliance (screening and stabilization obligations)");
    risks.push("Stark Law — physician self-referral restrictions");
    risks.push("Condition of Participation compliance");
    risks.push("Never Events and hospital-acquired conditions");
  }
  if (orgType.includes("physician") || orgType.includes("practice")) {
    risks.push("Stark Law — physician self-referral for designated health services");
    risks.push("Evaluation and Management (E/M) coding accuracy");
    risks.push("Modifier usage compliance");
  }
  if (orgType.includes("nursing") || orgType.includes("snf")) {
    risks.push("MDS accuracy and resident assessment");
    risks.push("Therapy utilization appropriateness");
    risks.push("Quality measure reporting accuracy");
  }
  if (orgType.includes("home health")) {
    risks.push("OASIS accuracy and outcome reporting");
    risks.push("Homebound status documentation");
    risks.push("Face-to-face encounter requirements");
  }

  risks.push("HIPAA Privacy and Security compliance");
  risks.push("Workforce training and competency");
  risks.push("Vendor/contractor compliance obligations");

  return risks;
}

function getApplicableOIGGuidance(organizationType: string): string {
  const lower = organizationType.toLowerCase();

  if (lower.includes("hospital")) {
    return `- OIG Compliance Program Guidance for Hospitals (63 FR 8987, Feb. 23, 1998)
- OIG Supplemental Compliance Program Guidance for Hospitals (70 FR 4858, Jan. 31, 2005)
- OIG General Compliance Program Guidance (November 2023)`;
  }
  if (lower.includes("physician") || lower.includes("practice") || lower.includes("dental")) {
    return `- OIG Compliance Program Guidance for Individual and Small Group Physician Practices (65 FR 59434, Oct. 5, 2000)
- OIG General Compliance Program Guidance (November 2023)`;
  }
  if (lower.includes("nursing")) {
    return `- OIG Compliance Program Guidance for Nursing Facilities (65 FR 14289, Mar. 16, 2000)
- OIG General Compliance Program Guidance (November 2023)`;
  }
  if (lower.includes("home health")) {
    return `- OIG Compliance Program Guidance for Home Health Agencies (63 FR 42410, Aug. 7, 1998)
- OIG General Compliance Program Guidance (November 2023)`;
  }
  if (lower.includes("billing")) {
    return `- OIG Compliance Program Guidance for Third-Party Medical Billing Companies (63 FR 70138, Dec. 18, 1998)
- OIG General Compliance Program Guidance (November 2023)`;
  }

  return `- OIG General Compliance Program Guidance (November 2023)
- Applicable entity-specific OIG guidance documents`;
}

function identifyComplianceProgramGaps(programInput: ComplianceProgramInput): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  // Compliance Officer designation
  gaps.push({
    standard: "OIG Element 2 — Compliance Officer",
    requirement: "Designate a Chief Compliance Officer with sufficient authority, resources, and direct access to governing body",
    currentState: "Compliance program document generated; CCO must be formally designated",
    severity: "high",
    recommendedAction: "Formally designate a qualified Chief Compliance Officer; ensure direct reporting line to Board of Directors/governing body; allocate sufficient budget and FTE resources; document designation in Board minutes",
  });

  // Training implementation
  gaps.push({
    standard: "OIG Element 3 — Training and Education",
    requirement: "All employees must receive general compliance training within 90 days of hire and annual refresher",
    currentState: "Training program established in compliance plan; implementation and tracking system needed",
    severity: "high",
    recommendedAction: "Implement compliance training program: develop or acquire training content; establish LMS or tracking system; schedule initial training for all current employees within 60 days; integrate into new hire onboarding",
  });

  // Hotline/reporting mechanism
  gaps.push({
    standard: "OIG Element 4 — Communication Lines",
    requirement: "Establish accessible, anonymous reporting mechanism (compliance hotline) with non-retaliation protections",
    currentState: "Reporting mechanism defined in program; requires implementation",
    severity: "high",
    recommendedAction: "Implement compliance hotline (contract with third-party hotline provider for anonymity); publicize hotline number widely; train workforce on reporting procedures; implement non-retaliation policy",
  });

  // Exclusion screening
  if (programInput.participatesInFederalPrograms) {
    gaps.push({
      standard: "42 U.S.C. 1320a-7 / OIG Element 6",
      requirement: "Screen all employees, contractors, and vendors against OIG LEIE and SAM at hire and monthly",
      currentState: "Exclusion screening requirement documented; screening program must be implemented",
      severity: "critical",
      recommendedAction: "Immediately implement OIG LEIE and SAM exclusion screening for all current workforce members and contractors; establish monthly re-screening process; document all screenings; establish response protocol for identified exclusions",
    });
  }

  // Audit plan
  gaps.push({
    standard: "OIG Element 5 — Monitoring and Auditing",
    requirement: "Develop and execute annual compliance audit work plan based on risk assessment",
    currentState: "Audit framework established in program; specific audit plan and baseline assessment needed",
    severity: "medium",
    recommendedAction: "Develop Year 1 audit work plan: conduct baseline compliance assessment; schedule monthly claims sample audits; align focus areas with current OIG Work Plan priorities; establish audit committee reporting cadence",
  });

  // 60-Day Rule
  if (programInput.participatesInFederalPrograms) {
    gaps.push({
      standard: "42 U.S.C. 1320a-7k(d) — 60-Day Overpayment Rule",
      requirement: "Overpayments must be reported and returned within 60 days of identification (or date corresponding cost report is due)",
      currentState: "Overpayment procedures documented; operational process for identification and return must be implemented",
      severity: "high",
      recommendedAction: "Implement overpayment identification process: train billing staff on identification triggers; establish review committee; implement credit balance reporting; document the 60-day clock from identification to return; establish refund procedures with Medicare/Medicaid contractors",
    });
  }

  // Board education
  gaps.push({
    standard: "OIG Element 3 / Governance — Board Education",
    requirement: "Board of Directors/governing body must receive compliance education and annual compliance program report",
    currentState: "Board reporting requirement established; initial education and reporting cadence needed",
    severity: "medium",
    recommendedAction: "Schedule Board compliance education session within 90 days; establish quarterly compliance committee reporting to Board; ensure Board understands fiduciary compliance oversight responsibilities",
  });

  return gaps;
}

function calculateProgramComplianceScore(programInput: ComplianceProgramInput): number {
  let score = 70; // Baseline for having comprehensive program documentation

  // Adjustments based on risk factors
  if (programInput.organizationSize === "large") {
    score -= 5; // Larger orgs face more complexity
  }
  if (programInput.participatesInFederalPrograms) {
    score -= 5; // Federal program participation adds risk
  }
  if (programInput.organizationType === "Hospital") {
    score -= 5; // Hospitals have highest complexity
  }

  return Math.max(50, Math.min(85, score));
}
