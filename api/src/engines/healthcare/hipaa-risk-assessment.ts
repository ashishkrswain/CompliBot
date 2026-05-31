import { generateReportWithLLM, parseReportSections } from "../../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../../services/report-generator.js";
import {
  ALL_HIPAA_STANDARDS,
  ADMINISTRATIVE_SAFEGUARDS,
  PHYSICAL_SAFEGUARDS,
  TECHNICAL_SAFEGUARDS,
} from "../../data/healthcare/hipaa-standards.js";
import type { HIPAAStandard } from "../../data/healthcare/hipaa-standards.js";

const HIPAA_SRA_SYSTEM_PROMPT = `You are an expert HIPAA Security Officer generating a complete Security Risk Assessment (SRA) per 45 CFR 164.308(a)(1)(ii)(A).

This SRA must comply with:
- NIST SP 800-30 (Guide for Conducting Risk Assessments)
- OCR Guidance on Risk Analysis Requirements (July 2010)
- 45 CFR 164.308(a)(1)(ii)(A) — Risk Analysis requirement
- 45 CFR 164.306(a) — General security requirements

The SRA must evaluate ALL 18 standards across Administrative (§164.308), Physical (§164.310), and Technical (§164.312) Safeguards plus Organizational Requirements (§164.314) and Policies/Procedures (§164.316).

For each standard, you MUST assess:
1. Current implementation status (Implemented / Partially Implemented / Not Implemented)
2. Threat sources and vulnerabilities
3. Likelihood of exploitation (High / Medium / Low)
4. Impact if exploited (High / Medium / Low)
5. Risk level (Critical / High / Medium / Low)
6. Current controls in place
7. Gaps identified
8. Corrective action with specific citation

Use proper HIPAA section numbers (e.g., §164.308(a)(5)(ii)(A) for Security Reminders).
Generate professional-quality content suitable for OCR audit review.`;

interface SRAInput {
  facilityType: string;
  itSystems: string[];
  employeeCount: number;
  vendorList: string[];
  currentControls: Record<string, string>;
}

interface RiskRating {
  standard: HIPAAStandard;
  status: "implemented" | "partially_implemented" | "not_implemented";
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  riskLevel: "critical" | "high" | "medium" | "low";
  threats: string[];
  vulnerabilities: string[];
  existingControls: string[];
  gaps: string[];
  correctiveAction: string;
}

export async function generateHipaaSRAReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const sraInput = extractSRAInput(input);
  const riskRatings = performRiskAssessment(sraInput);
  const summaryStats = calculateSRASummary(riskRatings);

  const additionalContext = buildSRAContext(sraInput, riskRatings, summaryStats);

  const rawContent = await generateReportWithLLM(
    input,
    HIPAA_SRA_SYSTEM_PROMPT,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = buildSRAGaps(riskRatings);

  return {
    title: `HIPAA Security Risk Assessment — ${input.facilityName} — ${new Date().toISOString().split("T")[0]}`,
    summary: `Security Risk Assessment per 45 CFR 164.308(a)(1)(ii)(A) for ${input.facilityName}. ${summaryStats.totalStandards} standards assessed. Overall compliance: ${summaryStats.compliancePercentage}%. Critical risks: ${summaryStats.criticalCount}. High risks: ${summaryStats.highCount}. Requires immediate action on ${summaryStats.criticalCount + summaryStats.highCount} findings.`,
    complianceScore: summaryStats.compliancePercentage,
    sections,
    gaps,
  };
}

function extractSRAInput(input: ReportGenerationInput): SRAInput {
  const records = input.extractedRecords as Array<Record<string, unknown>>;
  const operationalData = input.operationalData;

  const itSystems: string[] = [];
  const vendorList: string[] = [];
  const currentControls: Record<string, string> = {};

  for (const record of records) {
    if (record["itSystem"] && typeof record["itSystem"] === "string") {
      itSystems.push(record["itSystem"]);
    }
    if (record["vendor"] && typeof record["vendor"] === "string") {
      vendorList.push(record["vendor"]);
    }
    if (record["controlCategory"] && record["controlStatus"]) {
      currentControls[String(record["controlCategory"])] = String(record["controlStatus"]);
    }
  }

  // Parse from operational data if structured records are sparse
  if (itSystems.length === 0) {
    const systemMatches = operationalData.match(/(?:EHR|EMR|system|software|platform):\s*([^\n,]+)/gi);
    if (systemMatches) {
      itSystems.push(...systemMatches.map((m) => m.replace(/^[^:]+:\s*/, "").trim()));
    }
    if (itSystems.length === 0) {
      itSystems.push("EHR System", "Email System", "Network Infrastructure");
    }
  }

  if (vendorList.length === 0) {
    const vendorMatches = operationalData.match(/(?:vendor|BA|business associate):\s*([^\n,]+)/gi);
    if (vendorMatches) {
      vendorList.push(...vendorMatches.map((m) => m.replace(/^[^:]+:\s*/, "").trim()));
    }
  }

  return {
    facilityType: input.facilityType,
    itSystems,
    employeeCount: input.employeeCount,
    vendorList,
    currentControls,
  };
}

function performRiskAssessment(sraInput: SRAInput): RiskRating[] {
  const ratings: RiskRating[] = [];

  for (const standard of ALL_HIPAA_STANDARDS) {
    const rating = assessStandard(standard, sraInput);
    ratings.push(rating);
  }

  return ratings;
}

function assessStandard(standard: HIPAAStandard, sraInput: SRAInput): RiskRating {
  const controlKey = standard.section;
  const existingControl = sraInput.currentControls[controlKey];

  let status: RiskRating["status"] = "partially_implemented";
  if (existingControl === "implemented" || existingControl === "full") {
    status = "implemented";
  } else if (existingControl === "none" || existingControl === "not_implemented") {
    status = "not_implemented";
  }

  // Default assessment based on standard category and common healthcare gaps
  const assessment = getDefaultAssessment(standard, sraInput, status);

  return {
    standard,
    status: assessment.status,
    likelihood: assessment.likelihood,
    impact: assessment.impact,
    riskLevel: calculateRiskLevel(assessment.likelihood, assessment.impact),
    threats: assessment.threats,
    vulnerabilities: assessment.vulnerabilities,
    existingControls: assessment.existingControls,
    gaps: assessment.gaps,
    correctiveAction: assessment.correctiveAction,
  };
}

function getDefaultAssessment(
  standard: HIPAAStandard,
  sraInput: SRAInput,
  currentStatus: RiskRating["status"]
): {
  status: RiskRating["status"];
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  threats: string[];
  vulnerabilities: string[];
  existingControls: string[];
  gaps: string[];
  correctiveAction: string;
} {
  // Assessment logic varies by standard section
  switch (standard.section) {
    case "164.308(a)(1)":
      return {
        status: currentStatus,
        likelihood: currentStatus === "implemented" ? "low" : "high",
        impact: "high",
        threats: ["External threat actors", "Insider threats", "Ransomware", "Phishing attacks"],
        vulnerabilities: ["Incomplete risk analysis", "Outdated risk assessment", "No continuous monitoring"],
        existingControls: sraInput.currentControls["risk_management"] ? ["Risk management program in place"] : [],
        gaps: currentStatus !== "implemented"
          ? ["Risk analysis not conducted within the past year", "No formal risk management plan documented"]
          : [],
        correctiveAction: "Conduct comprehensive risk analysis per NIST SP 800-30; document all threats, vulnerabilities, and risk levels; implement risk management plan per §164.308(a)(1)(ii)(B)",
      };

    case "164.308(a)(2)":
      return {
        status: currentStatus,
        likelihood: "low",
        impact: "high",
        threats: ["Lack of accountability", "Uncoordinated security response"],
        vulnerabilities: ["No designated security official", "Security responsibilities not documented"],
        existingControls: ["Organization structure exists"],
        gaps: currentStatus !== "implemented"
          ? ["Security official not formally designated in writing"]
          : [],
        correctiveAction: "Formally designate a Security Official in writing per §164.308(a)(2); document role, responsibilities, and authority",
      };

    case "164.308(a)(3)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Unauthorized workforce access", "Terminated employee access not revoked", "Inappropriate access levels"],
        vulnerabilities: ["No formal clearance procedures", "Delayed termination of access", "No periodic access reviews"],
        existingControls: sraInput.employeeCount > 50 ? ["HR onboarding/offboarding process exists"] : [],
        gaps: currentStatus !== "implemented"
          ? ["Workforce clearance procedures not formally documented", "Termination procedures not consistently applied within 24 hours"]
          : [],
        correctiveAction: "Implement formal workforce security procedures per §164.308(a)(3); establish clearance procedures for ePHI access; implement same-day termination of access upon workforce separation",
      };

    case "164.308(a)(4)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Excessive access privileges", "Unauthorized access to ePHI", "Role creep"],
        vulnerabilities: ["No role-based access control", "Access not reviewed periodically", "No formal access request process"],
        existingControls: sraInput.itSystems.length > 0 ? ["EHR system has user roles defined"] : [],
        gaps: currentStatus !== "implemented"
          ? ["No formal access authorization policy", "Access not reviewed at least annually"]
          : [],
        correctiveAction: "Implement formal access authorization and establishment procedures per §164.308(a)(4); define role-based access levels; conduct quarterly access reviews",
      };

    case "164.308(a)(5)":
      return {
        status: currentStatus,
        likelihood: "high",
        impact: "high",
        threats: ["Phishing attacks", "Social engineering", "Malware", "Credential theft"],
        vulnerabilities: ["Untrained workforce", "No security awareness program", "No phishing simulations"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["No formal security awareness training program", "Training not conducted at hire and annually", "No anti-phishing training"]
          : [],
        correctiveAction: "Establish comprehensive security awareness and training program per §164.308(a)(5); include annual training for all workforce members; implement periodic security reminders and phishing simulations",
      };

    case "164.308(a)(6)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Security incidents undetected", "Delayed incident response", "Evidence destruction"],
        vulnerabilities: ["No incident response plan", "No incident tracking system", "Staff untrained on reporting"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["No formal security incident response procedures", "No incident tracking and documentation system"]
          : [],
        correctiveAction: "Develop and implement security incident procedures per §164.308(a)(6)(ii); establish incident tracking system; train workforce on incident identification and reporting",
      };

    case "164.308(a)(7)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Natural disaster", "System failure", "Ransomware", "Power outage", "Hardware failure"],
        vulnerabilities: ["No backup procedures", "No disaster recovery plan", "Untested contingency plan"],
        existingControls: sraInput.itSystems.length > 0 ? ["IT infrastructure exists with some redundancy"] : [],
        gaps: currentStatus !== "implemented"
          ? ["Contingency plan not tested within the past year", "No documented emergency mode operation plan", "Backup procedures not verified"]
          : [],
        correctiveAction: "Establish comprehensive contingency plan per §164.308(a)(7) including: data backup plan (tested quarterly), disaster recovery plan (tested annually), emergency mode operation plan; conduct annual applications and data criticality analysis",
      };

    case "164.308(a)(8)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "medium",
        threats: ["Unknown compliance gaps", "Evolving threat landscape", "Regulatory changes"],
        vulnerabilities: ["No periodic evaluation", "Assessment not updated after changes"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["No periodic technical and nontechnical evaluation performed", "Evaluation not conducted after significant operational changes"]
          : [],
        correctiveAction: "Implement periodic evaluation program per §164.308(a)(8); conduct at minimum annual nontechnical evaluation; perform technical evaluation after any significant system changes",
      };

    case "164.308(b)(1)":
      return {
        status: sraInput.vendorList.length === 0 ? "implemented" : currentStatus,
        likelihood: sraInput.vendorList.length > 3 ? "high" : "medium",
        impact: "high",
        threats: ["BA data breach", "Subcontractor noncompliance", "Unauthorized BA access"],
        vulnerabilities: ["BAAs not executed for all vendors", "BAAs not reviewed/updated", "No BA oversight program"],
        existingControls: sraInput.vendorList.length > 0 ? ["Some BAAs in place"] : ["No BAs identified"],
        gaps: sraInput.vendorList.length > 0 && currentStatus !== "implemented"
          ? ["BAAs not executed for all business associates", "No BA compliance monitoring program", "BAAs not updated to HITECH/Omnibus requirements"]
          : [],
        correctiveAction: "Execute compliant BAAs per §164.308(b) and §164.314(a) for all business associates; implement BA oversight program; review BAAs annually for completeness",
      };

    case "164.310(a)(1)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Unauthorized physical access", "Theft of equipment", "Tailgating"],
        vulnerabilities: ["Unlocked server rooms", "No visitor logs", "No badge access for sensitive areas"],
        existingControls: ["Physical facility exists with some locking mechanisms"],
        gaps: currentStatus !== "implemented"
          ? ["No documented facility security plan", "Server room/data center access not restricted by badge/key", "No visitor control procedures"]
          : [],
        correctiveAction: "Implement facility access control procedures per §164.310(a); establish facility security plan; implement badge access for areas containing ePHI systems; maintain visitor logs and escort policies",
      };

    case "164.310(b)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "medium",
        threats: ["Unauthorized viewing of ePHI", "Shoulder surfing", "Unattended workstations"],
        vulnerabilities: ["No workstation use policy", "Screens visible to public areas", "No privacy screens"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["No formal workstation use policy", "Workstation placement not assessed for privacy"]
          : [],
        correctiveAction: "Implement workstation use policies per §164.310(b); specify permitted functions and physical attributes of workstation locations; deploy privacy screens where workstations face public areas",
      };

    case "164.310(c)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "medium",
        threats: ["Theft of workstations", "Unauthorized physical access to workstations"],
        vulnerabilities: ["Portable devices unsecured", "No cable locks", "No secure storage for laptops"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["No physical security controls for workstations accessing ePHI", "Portable devices not secured when unattended"]
          : [],
        correctiveAction: "Implement physical safeguards for workstations per §164.310(c); deploy cable locks for desktops; require locked storage for portable devices; implement auto-lock after inactivity",
      };

    case "164.310(d)(1)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Data exposure from disposed media", "Lost/stolen portable media", "Improper media reuse"],
        vulnerabilities: ["No media sanitization procedures", "No hardware inventory", "No disposal documentation"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["No formal device and media control policy", "No documented disposal procedures meeting NIST SP 800-88", "No hardware/media tracking system"]
          : [],
        correctiveAction: "Implement device and media controls per §164.310(d); establish disposal procedures per NIST SP 800-88 (clear, purge, or destroy); maintain hardware inventory with chain of custody; document all media movements",
      };

    case "164.312(a)(1)":
      return {
        status: currentStatus,
        likelihood: "high",
        impact: "high",
        threats: ["Brute force attacks", "Credential theft", "Unauthorized system access", "Privilege escalation"],
        vulnerabilities: ["Weak passwords", "Shared accounts", "No MFA", "No automatic logoff"],
        existingControls: sraInput.itSystems.length > 0 ? ["Systems have username/password authentication"] : [],
        gaps: currentStatus !== "implemented"
          ? ["Multi-factor authentication not implemented for remote access", "Automatic logoff not configured on all systems", "Encryption at rest not implemented for all ePHI databases"]
          : [],
        correctiveAction: "Implement comprehensive access controls per §164.312(a); assign unique user IDs to all users; implement MFA for remote access and privileged accounts; configure automatic logoff (15 min); encrypt ePHI at rest using AES-256 or equivalent",
      };

    case "164.312(b)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Undetected unauthorized access", "Inability to investigate incidents", "Compliance audit failure"],
        vulnerabilities: ["No audit logging", "Logs not reviewed", "Insufficient log retention"],
        existingControls: sraInput.itSystems.length > 0 ? ["EHR system has basic audit trail"] : [],
        gaps: currentStatus !== "implemented"
          ? ["Audit logs not reviewed regularly", "Log retention less than 6 years (HIPAA requirement)", "Not all systems generating audit logs for ePHI access"]
          : [],
        correctiveAction: "Implement audit controls per §164.312(b); enable logging on all systems containing ePHI; retain logs for minimum 6 years; implement weekly log review process; configure alerts for anomalous access patterns",
      };

    case "164.312(c)(1)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Data corruption", "Unauthorized modification of ePHI", "Ransomware altering records"],
        vulnerabilities: ["No integrity verification mechanisms", "No checksums on data at rest", "No change detection"],
        existingControls: sraInput.itSystems.length > 0 ? ["Database systems have built-in integrity checks"] : [],
        gaps: currentStatus !== "implemented"
          ? ["No mechanism to authenticate ePHI integrity", "No file integrity monitoring for ePHI stores"]
          : [],
        correctiveAction: "Implement integrity controls per §164.312(c); deploy file integrity monitoring on ePHI systems; implement checksums/hashing for data validation; establish change detection alerts",
      };

    case "164.312(d)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["Identity spoofing", "Impersonation attacks", "Credential sharing"],
        vulnerabilities: ["Weak authentication", "No identity verification for password resets", "Shared credentials"],
        existingControls: ["Username/password authentication exists"],
        gaps: currentStatus !== "implemented"
          ? ["No multi-factor authentication for system access", "Identity verification procedures for remote access not documented"]
          : [],
        correctiveAction: "Implement person/entity authentication per §164.312(d); deploy multi-factor authentication; establish identity verification procedures for help desk/password resets; prohibit credential sharing",
      };

    case "164.312(e)(1)":
      return {
        status: currentStatus,
        likelihood: "high",
        impact: "high",
        threats: ["Man-in-the-middle attacks", "Eavesdropping on network traffic", "Email interception"],
        vulnerabilities: ["Unencrypted email with PHI", "No TLS on data transmissions", "Unencrypted wireless networks"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["ePHI transmitted via unencrypted email", "Not all external connections use TLS 1.2+", "Wireless networks not using WPA3/WPA2-Enterprise"]
          : [],
        correctiveAction: "Implement transmission security per §164.312(e); enforce TLS 1.2+ for all ePHI transmissions; deploy encrypted email solution for PHI communications; implement WPA2-Enterprise or WPA3 for wireless; use VPN for remote access",
      };

    case "164.314(a)(1)":
      return {
        status: sraInput.vendorList.length === 0 ? "implemented" : currentStatus,
        likelihood: "medium",
        impact: "high",
        threats: ["BA noncompliance", "Subcontractor breaches", "Unauthorized data use by BA"],
        vulnerabilities: ["Incomplete BAAs", "No BA monitoring", "Outdated agreements"],
        existingControls: [],
        gaps: sraInput.vendorList.length > 0 && currentStatus !== "implemented"
          ? ["Not all BAs have compliant written agreements", "BAAs missing required Omnibus Rule provisions"]
          : [],
        correctiveAction: "Ensure all BA contracts meet §164.314(a) requirements; include required provisions for safeguards, reporting, subcontractors, and termination; review and update all BAAs to current regulatory requirements",
      };

    case "164.314(b)(1)":
      return {
        status: "implemented",
        likelihood: "low",
        impact: "medium",
        threats: ["Plan sponsor unauthorized access to ePHI"],
        vulnerabilities: ["Insufficient plan document provisions"],
        existingControls: ["Standard group health plan language"],
        gaps: [],
        correctiveAction: "Verify group health plan documents include required provisions per §164.314(b) if applicable",
      };

    case "164.316(a)":
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "medium",
        threats: ["Inconsistent practices", "Audit failure", "Staff confusion on procedures"],
        vulnerabilities: ["No written policies", "Outdated policies", "Policies not distributed"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["HIPAA policies and procedures not fully documented", "Policies not reviewed within the past year"]
          : [],
        correctiveAction: "Develop and maintain comprehensive HIPAA policies and procedures per §164.316(a); review annually and update as needed; distribute to all workforce members",
      };

    case "164.316(b)(1)":
      return {
        status: currentStatus,
        likelihood: "low",
        impact: "medium",
        threats: ["Inability to demonstrate compliance", "Audit failure", "Lost documentation"],
        vulnerabilities: ["Documentation not retained for 6 years", "No version control", "Documentation not accessible"],
        existingControls: [],
        gaps: currentStatus !== "implemented"
          ? ["Documentation retention period not verified at 6 years", "No formal version control for policy documents"]
          : [],
        correctiveAction: "Implement documentation requirements per §164.316(b); retain all HIPAA documentation for minimum 6 years; make documentation available to responsible workforce members; review and update periodically",
      };

    default:
      return {
        status: currentStatus,
        likelihood: "medium",
        impact: "medium",
        threats: ["General noncompliance risk"],
        vulnerabilities: ["Standard not assessed"],
        existingControls: [],
        gaps: ["Standard requires assessment"],
        correctiveAction: `Assess compliance with ${standard.section} — ${standard.title}`,
      };
  }
}

function calculateRiskLevel(
  likelihood: "high" | "medium" | "low",
  impact: "high" | "medium" | "low"
): "critical" | "high" | "medium" | "low" {
  const matrix: Record<string, Record<string, "critical" | "high" | "medium" | "low">> = {
    high: { high: "critical", medium: "high", low: "medium" },
    medium: { high: "high", medium: "medium", low: "low" },
    low: { high: "medium", medium: "low", low: "low" },
  };
  return matrix[likelihood]![impact]!;
}

function calculateSRASummary(ratings: RiskRating[]) {
  const totalStandards = ratings.length;
  const implementedCount = ratings.filter((r) => r.status === "implemented").length;
  const partialCount = ratings.filter((r) => r.status === "partially_implemented").length;
  const notImplementedCount = ratings.filter((r) => r.status === "not_implemented").length;
  const criticalCount = ratings.filter((r) => r.riskLevel === "critical").length;
  const highCount = ratings.filter((r) => r.riskLevel === "high").length;
  const mediumCount = ratings.filter((r) => r.riskLevel === "medium").length;
  const lowCount = ratings.filter((r) => r.riskLevel === "low").length;

  // Weighted compliance: implemented=100%, partial=50%, not_implemented=0%
  const compliancePercentage = Math.round(
    ((implementedCount * 100 + partialCount * 50) / (totalStandards * 100)) * 100
  );

  return {
    totalStandards,
    implementedCount,
    partialCount,
    notImplementedCount,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    compliancePercentage,
  };
}

function buildSRAContext(
  sraInput: SRAInput,
  riskRatings: RiskRating[],
  summaryStats: ReturnType<typeof calculateSRASummary>
): string {
  const adminRatings = riskRatings.filter((r) => r.standard.category === "administrative");
  const physicalRatings = riskRatings.filter((r) => r.standard.category === "physical");
  const technicalRatings = riskRatings.filter((r) => r.standard.category === "technical");

  return `
HIPAA SECURITY RISK ASSESSMENT INPUT:

FACILITY INFORMATION:
- Type: ${sraInput.facilityType}
- Workforce Size: ${sraInput.employeeCount}
- IT Systems: ${sraInput.itSystems.join(", ") || "Not specified"}
- Business Associates/Vendors: ${sraInput.vendorList.join(", ") || "None identified"}

ASSESSMENT SUMMARY:
- Total Standards Assessed: ${summaryStats.totalStandards}
- Implemented: ${summaryStats.implementedCount}
- Partially Implemented: ${summaryStats.partialCount}
- Not Implemented: ${summaryStats.notImplementedCount}
- Overall Compliance: ${summaryStats.compliancePercentage}%

RISK DISTRIBUTION:
- Critical: ${summaryStats.criticalCount}
- High: ${summaryStats.highCount}
- Medium: ${summaryStats.mediumCount}
- Low: ${summaryStats.lowCount}

ADMINISTRATIVE SAFEGUARDS (§164.308) — ${ADMINISTRATIVE_SAFEGUARDS.length} Standards:
${formatRatingsByCategory(adminRatings)}

PHYSICAL SAFEGUARDS (§164.310) — ${PHYSICAL_SAFEGUARDS.length} Standards:
${formatRatingsByCategory(physicalRatings)}

TECHNICAL SAFEGUARDS (§164.312) — ${TECHNICAL_SAFEGUARDS.length} Standards:
${formatRatingsByCategory(technicalRatings)}

Generate a complete HIPAA Security Risk Assessment report including:
1. Executive Summary with overall risk posture
2. Scope and Methodology (NIST SP 800-30 aligned)
3. Asset Inventory and ePHI Data Flow
4. Threat and Vulnerability Assessment for each standard
5. Risk Rating Matrix (all 18+ standards)
6. Administrative Safeguards Assessment (§164.308)
7. Physical Safeguards Assessment (§164.310)
8. Technical Safeguards Assessment (§164.312)
9. Organizational Requirements Assessment (§164.314)
10. Policies and Procedures Assessment (§164.316)
11. Corrective Action Plan (prioritized by risk level)
12. Management Sign-Off Statement`;
}

function formatRatingsByCategory(ratings: RiskRating[]): string {
  return ratings
    .map(
      (r) =>
        `  ${r.standard.section} — ${r.standard.title}
    Status: ${r.status.replace("_", " ")} | Risk: ${r.riskLevel.toUpperCase()}
    Gaps: ${r.gaps.length > 0 ? r.gaps.join("; ") : "None identified"}
    Action: ${r.correctiveAction}`
    )
    .join("\n\n");
}

function buildSRAGaps(riskRatings: RiskRating[]): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  for (const rating of riskRatings) {
    if (rating.gaps.length === 0) continue;

    for (const gapText of rating.gaps) {
      gaps.push({
        standard: `45 CFR ${rating.standard.section}`,
        requirement: `${rating.standard.title}: ${rating.standard.requirementText.slice(0, 200)}`,
        currentState: gapText,
        severity: rating.riskLevel,
        recommendedAction: rating.correctiveAction,
      });
    }
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  return gaps;
}
