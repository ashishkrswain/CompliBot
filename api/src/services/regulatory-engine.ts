import { ALL_STANDARDS, getRequirementsForStandard, getStandardByAgency } from "../lib/regulations.js";
import type { RegulatoryStandard, RegulatorySubpart } from "../lib/regulations.js";
import { ALL_HIPAA_STANDARDS } from "../data/healthcare/hipaa-standards.js";
import type { HIPAAStandard } from "../data/healthcare/hipaa-standards.js";

export interface RegulatoryRequirementResult {
  standard: string;
  section: string;
  title: string;
  requirements: string[];
  frequency: string;
  applicability: string;
}

export interface StandardSummary {
  code: string;
  title: string;
  agency: string;
  sectionCount: number;
  sections: Array<{ section: string; title: string }>;
}

export function getRequirementsForType(projectType: string): RegulatoryRequirementResult[] {
  switch (projectType) {
    case "OSHA_300":
      return getOsha300Requirements();
    case "EPA_TIER2":
      return getEpaTier2Requirements();
    case "MAINTENANCE_AUDIT":
      return getMaintenanceRequirements();
    case "SAFETY_INSPECTION":
      return getSafetyInspectionRequirements();
    case "HIPAA_SRA":
      return getHipaaSRARequirements();
    case "HIPAA_POLICIES":
      return getHipaaPoliciesRequirements();
    case "HIPAA_BREACH":
      return getHipaaBreachRequirements();
    case "HIPAA_BAA":
      return getHipaaBAARequirements();
    case "BLOODBORNE":
      return getBloodborneRequirements();
    case "COMPLIANCE_PROGRAM":
      return getComplianceProgramRequirements();
    default:
      return [];
  }
}

function getOsha300Requirements(): RegulatoryRequirementResult[] {
  const subparts = getRequirementsForStandard("1904");
  return subparts.map(mapSubpartToResult("29 CFR 1904"));
}

function getEpaTier2Requirements(): RegulatoryRequirementResult[] {
  const subparts = getRequirementsForStandard("370");
  return subparts.map(mapSubpartToResult("40 CFR 370"));
}

function getMaintenanceRequirements(): RegulatoryRequirementResult[] {
  const standard = ALL_STANDARDS.find((s) => s.title.includes("Maintenance"));
  if (!standard) return [];
  return standard.subparts.map(mapSubpartToResult("Multiple"));
}

function getSafetyInspectionRequirements(): RegulatoryRequirementResult[] {
  const oshaGeneral = ALL_STANDARDS.find((s) => s.code === "29 CFR 1910");
  if (!oshaGeneral) return [];
  return oshaGeneral.subparts.map(mapSubpartToResult("29 CFR 1910"));
}

function mapSubpartToResult(standard: string) {
  return (subpart: RegulatorySubpart): RegulatoryRequirementResult => ({
    standard,
    section: subpart.section,
    title: subpart.title,
    requirements: subpart.requirements,
    frequency: subpart.recordkeepingFrequency,
    applicability: subpart.applicability,
  });
}

export function getAllStandardSummaries(): StandardSummary[] {
  return ALL_STANDARDS.map((standard: RegulatoryStandard) => ({
    code: standard.code,
    title: standard.title,
    agency: standard.agency,
    sectionCount: standard.subparts.length,
    sections: standard.subparts.map((s) => ({ section: s.section, title: s.title })),
  }));
}

export function getStandardsByAgency(agency: "OSHA" | "EPA" | "NFPA" | "ASME" | "HHS"): StandardSummary[] {
  if (agency === "HHS") {
    return getHHSStandardSummaries();
  }
  const standards = getStandardByAgency(agency);
  return standards.map((standard) => ({
    code: standard.code,
    title: standard.title,
    agency: standard.agency,
    sectionCount: standard.subparts.length,
    sections: standard.subparts.map((s) => ({ section: s.section, title: s.title })),
  }));
}

function getHHSStandardSummaries(): StandardSummary[] {
  return [
    {
      code: "45 CFR 164 Subpart C",
      title: "HIPAA Security Rule",
      agency: "HHS" as unknown as string,
      sectionCount: ALL_HIPAA_STANDARDS.length,
      sections: ALL_HIPAA_STANDARDS.map((s) => ({ section: s.section, title: s.title })),
    },
  ];
}

function mapHIPAAToRegulatoryResult(standard: HIPAAStandard): RegulatoryRequirementResult {
  const requirements = [standard.requirementText];
  for (const spec of standard.implementationSpecs) {
    requirements.push(`${spec.title} (${spec.requiredOrAddressable}): ${spec.description}`);
  }

  return {
    standard: `45 CFR ${standard.section}`,
    section: standard.section,
    title: standard.title,
    requirements,
    frequency: "Ongoing; periodic evaluation per §164.308(a)(8)",
    applicability: `${standard.category} safeguard — ${standard.requiredOrAddressable}`,
  };
}

function getHipaaSRARequirements(): RegulatoryRequirementResult[] {
  return ALL_HIPAA_STANDARDS.map(mapHIPAAToRegulatoryResult);
}

function getHipaaPoliciesRequirements(): RegulatoryRequirementResult[] {
  const policyStandards = ALL_HIPAA_STANDARDS.filter(
    (s) => s.category === "policies" || s.section === "164.308(a)(1)" || s.section === "164.308(a)(5)"
  );
  return policyStandards.map(mapHIPAAToRegulatoryResult);
}

function getHipaaBreachRequirements(): RegulatoryRequirementResult[] {
  return [
    {
      standard: "45 CFR 164.400-414",
      section: "164.402",
      title: "Breach Definition and Presumption",
      requirements: [
        "Breach means acquisition, access, use, or disclosure of PHI in violation of the Privacy Rule that compromises the security or privacy of the PHI",
        "Presumption of breach unless covered entity demonstrates low probability of compromise based on risk assessment",
        "Risk assessment must consider: (1) nature of PHI, (2) unauthorized person, (3) whether PHI was actually viewed, (4) mitigations",
      ],
      frequency: "Per incident",
      applicability: "All covered entities and business associates",
    },
    {
      standard: "45 CFR 164.404",
      section: "164.404",
      title: "Individual Notification",
      requirements: [
        "Notify affected individuals without unreasonable delay, no later than 60 calendar days from discovery",
        "Written notification by first-class mail (or email if individual agreed)",
        "Content must include: description of breach, types of information, steps to protect, entity's response, contact information",
        "Substitute notice if contact information insufficient",
      ],
      frequency: "Per breach event",
      applicability: "Covered entities",
    },
    {
      standard: "45 CFR 164.406",
      section: "164.406",
      title: "Media Notification",
      requirements: [
        "If breach affects 500+ residents of a state or jurisdiction",
        "Provide notice to prominent media outlets serving that state/jurisdiction",
        "Without unreasonable delay, no later than 60 days from discovery",
      ],
      frequency: "Per breach event (if threshold met)",
      applicability: "Covered entities — breaches of 500+ in a state",
    },
    {
      standard: "45 CFR 164.408",
      section: "164.408",
      title: "HHS Secretary Notification",
      requirements: [
        "Breaches of 500+ individuals: notify HHS within 60 days of discovery",
        "Breaches of fewer than 500: maintain log and submit annually within 60 days of end of calendar year",
        "Submit via HHS breach portal",
      ],
      frequency: "Per breach or annually for small breaches",
      applicability: "All covered entities",
    },
    {
      standard: "45 CFR 164.410",
      section: "164.410",
      title: "Business Associate Notification to Covered Entity",
      requirements: [
        "BA must notify CE of breach without unreasonable delay, no later than 60 days of discovery",
        "Must identify affected individuals if possible",
        "Must provide information CE needs for notification obligations",
      ],
      frequency: "Per breach event",
      applicability: "Business associates",
    },
  ];
}

function getHipaaBAARequirements(): RegulatoryRequirementResult[] {
  return [
    {
      standard: "45 CFR 164.314(a)",
      section: "164.314(a)(2)(i)",
      title: "Business Associate Contract Requirements",
      requirements: [
        "BA will implement administrative, physical, and technical safeguards per Security Rule",
        "BA will ensure any agent/subcontractor agrees to same restrictions",
        "BA will report any security incident of which it becomes aware",
        "BA will authorize termination if CE determines BA violated material term",
      ],
      frequency: "Per BA relationship; review annually",
      applicability: "All covered entities with business associates",
    },
    {
      standard: "45 CFR 164.504(e)",
      section: "164.504(e)(2)",
      title: "Privacy Rule BAA Requirements",
      requirements: [
        "Establish permitted/required uses and disclosures",
        "Not use or disclose PHI other than as permitted by contract or required by law",
        "Use appropriate safeguards to prevent unauthorized use/disclosure",
        "Report unauthorized uses/disclosures",
        "Ensure subcontractors agree to same restrictions",
        "Make PHI available for individual access rights",
        "Make PHI available for amendment",
        "Provide accounting of disclosures information",
        "Make practices available to Secretary for compliance determination",
        "Return or destroy all PHI upon termination (if feasible)",
      ],
      frequency: "Per BA relationship",
      applicability: "All covered entities",
    },
  ];
}

function getBloodborneRequirements(): RegulatoryRequirementResult[] {
  return [
    {
      standard: "29 CFR 1910.1030",
      section: "1910.1030(c)",
      title: "Exposure Control Plan",
      requirements: [
        "Written Exposure Control Plan reviewed and updated at least annually",
        "Exposure determination for each job classification",
        "Schedule and method of implementation for each section of the standard",
        "Documentation of consideration of safer sharps devices (Needlestick Safety Act)",
      ],
      frequency: "Annual review and update",
      applicability: "All employers with employees who have occupational exposure to blood/OPIM",
    },
    {
      standard: "29 CFR 1910.1030",
      section: "1910.1030(d)",
      title: "Methods of Compliance",
      requirements: [
        "Universal precautions observed to prevent contact with blood/OPIM",
        "Engineering controls examined and maintained/replaced on regular schedule",
        "Work practice controls to eliminate/minimize exposure",
        "PPE provided at no cost in appropriate sizes",
        "Housekeeping: written schedule for cleaning and decontamination",
      ],
      frequency: "Ongoing; engineering controls reviewed at least annually",
      applicability: "All covered employers",
    },
    {
      standard: "29 CFR 1910.1030",
      section: "1910.1030(f)",
      title: "Hepatitis B Vaccination and Post-Exposure Evaluation",
      requirements: [
        "HBV vaccination offered within 10 working days of initial assignment",
        "At no cost to employee, given by licensed healthcare professional",
        "Declination statement required if employee refuses",
        "Post-exposure evaluation and follow-up at no cost to employee",
        "Documentation of route, circumstances, source identification",
      ],
      frequency: "Within 10 days of initial assignment; per exposure incident",
      applicability: "All employees with occupational exposure",
    },
    {
      standard: "29 CFR 1910.1030",
      section: "1910.1030(g)(2)",
      title: "Training Requirements",
      requirements: [
        "Training at initial assignment and at least annually",
        "Training must cover all 13 elements specified in §1910.1030(g)(2)(vii)",
        "Trainer must be knowledgeable in subject matter",
        "Interactive training (opportunity for questions)",
        "Training records maintained for 3 years",
      ],
      frequency: "At hire and annually",
      applicability: "All employees with occupational exposure",
    },
  ];
}

function getComplianceProgramRequirements(): RegulatoryRequirementResult[] {
  return [
    {
      standard: "OIG Guidance",
      section: "Element 1",
      title: "Written Standards of Conduct",
      requirements: [
        "Code of Conduct distributed to all employees",
        "Compliance policies addressing identified risk areas",
        "Standards covering billing, coding, kickback, self-referral, and claims submission",
        "Annual acknowledgment signed by all workforce members",
      ],
      frequency: "Annual review and acknowledgment",
      applicability: "All healthcare entities, especially Medicare/Medicaid participants",
    },
    {
      standard: "OIG Guidance",
      section: "Element 2",
      title: "Compliance Officer and Committee",
      requirements: [
        "Designated Chief Compliance Officer",
        "Direct reporting access to CEO and governing body",
        "Compliance Committee with cross-functional representation",
        "Sufficient authority, resources, and independence",
      ],
      frequency: "Ongoing; committee meets at minimum quarterly",
      applicability: "All healthcare entities",
    },
    {
      standard: "OIG Guidance",
      section: "Element 5",
      title: "Internal Monitoring and Auditing",
      requirements: [
        "Annual audit work plan",
        "Regular claims/billing audits",
        "Coding accuracy reviews",
        "Exclusion screening (OIG LEIE and SAM) at hire and monthly",
        "Focus audits based on OIG Work Plan and identified risks",
      ],
      frequency: "Monthly minimum for claims audits; monthly for exclusion screening",
      applicability: "All healthcare entities participating in federal programs",
    },
    {
      standard: "42 U.S.C. 1320a-7k(d)",
      section: "60-Day Rule",
      title: "Overpayment Identification and Return",
      requirements: [
        "Report and return overpayments within 60 days of identification",
        "Exercise reasonable diligence to identify overpayments",
        "Retain overpayment is potential False Claims Act violation",
        "Document identification date and return process",
      ],
      frequency: "Within 60 days of identification",
      applicability: "All entities receiving Medicare/Medicaid payments",
    },
  ];
}
