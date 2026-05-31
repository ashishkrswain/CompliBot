import { generateReportWithLLM, parseReportSections } from "../../services/report-generator.js";
import type { ReportGenerationInput, GeneratedReport, GeneratedGap } from "../../services/report-generator.js";

const HIPAA_POLICIES_SYSTEM_PROMPT = `You are an expert HIPAA Privacy and Security Officer generating a complete HIPAA Policies and Procedures package.

You must generate ALL required HIPAA policies per 45 CFR 164.316(a). Each policy must include:
- Policy title and unique identifier
- Effective date and review date
- Purpose statement
- Scope (who is covered)
- Policy statement with specific HIPAA citations
- Procedures (step-by-step implementation)
- Responsibilities (roles and duties)
- Sanctions for non-compliance (per §164.308(a)(1)(ii)(C))
- Related policies cross-references
- Document control (version, approval, review cycle)

Policies must be organization-specific (use the organization name and type provided).
All citations must be to specific HIPAA sections (e.g., §164.308(a)(5)(ii)(A), not just "HIPAA").
Content must be professional quality suitable for regulatory audit.`;

interface PolicyInput {
  organizationName: string;
  organizationType: string;
  ehrSystem: string;
  employeeCount: number;
}

interface PolicyDefinition {
  id: string;
  title: string;
  hipaaSection: string;
  category: string;
  description: string;
  keyElements: string[];
}

const ALL_REQUIRED_POLICIES: PolicyDefinition[] = [
  {
    id: "POL-PRIV-001",
    title: "Privacy Policy / Notice of Privacy Practices",
    hipaaSection: "45 CFR 164.520",
    category: "Privacy",
    description: "Describes how PHI may be used and disclosed; individual rights regarding their PHI",
    keyElements: [
      "Uses and disclosures of PHI for treatment, payment, and healthcare operations",
      "Individual rights (access, amendment, accounting of disclosures, restrictions, confidential communications)",
      "Organization duties regarding PHI protection",
      "Complaint procedures",
      "Contact information for Privacy Officer and HHS",
      "Effective date and material revision procedures",
    ],
  },
  {
    id: "POL-SEC-001",
    title: "Information Security Policy (Master)",
    hipaaSection: "45 CFR 164.306",
    category: "Security",
    description: "Master security policy establishing the organization's commitment to protecting ePHI",
    keyElements: [
      "Scope of ePHI protection program",
      "Security management structure and responsibilities",
      "Risk-based approach to security per §164.306(b)",
      "Reasonable and appropriate safeguards commitment",
      "Compliance with all Security Rule standards",
      "Workforce obligations and sanctions",
      "Annual review and update requirements",
    ],
  },
  {
    id: "POL-SEC-002",
    title: "Access Control Policy",
    hipaaSection: "45 CFR 164.312(a)",
    category: "Technical Safeguards",
    description: "Technical policies for controlling access to ePHI systems",
    keyElements: [
      "Unique user identification requirement — §164.312(a)(2)(i)",
      "Emergency access procedures — §164.312(a)(2)(ii)",
      "Automatic logoff after 15 minutes of inactivity — §164.312(a)(2)(iii)",
      "Encryption of ePHI at rest — §164.312(a)(2)(iv)",
      "Role-based access control (RBAC) implementation",
      "Minimum necessary access principle",
      "Multi-factor authentication for remote access",
      "Password complexity requirements (12+ characters, complexity rules)",
      "Account lockout after 5 failed attempts",
      "Quarterly access reviews",
    ],
  },
  {
    id: "POL-SEC-003",
    title: "Audit Control Policy",
    hipaaSection: "45 CFR 164.312(b)",
    category: "Technical Safeguards",
    description: "Policies for recording and examining system activity",
    keyElements: [
      "Audit logging requirements for all ePHI systems",
      "Events to be logged: login/logout, PHI access, modifications, failed attempts, privilege changes",
      "Log review frequency (minimum weekly for high-risk systems)",
      "Log retention period (minimum 6 years per §164.316(b)(2)(i))",
      "Log protection and integrity mechanisms",
      "Anomaly detection and alerting",
      "Audit trail for Business Associate access",
      "Annual audit of audit controls effectiveness",
    ],
  },
  {
    id: "POL-SEC-004",
    title: "Data Integrity Policy",
    hipaaSection: "45 CFR 164.312(c)(1)",
    category: "Technical Safeguards",
    description: "Policies for protecting ePHI from improper alteration or destruction",
    keyElements: [
      "Mechanism to authenticate ePHI — §164.312(c)(2)",
      "File integrity monitoring for ePHI systems",
      "Database integrity controls and validation",
      "Checksums and hashing for data verification",
      "Change detection and alerting",
      "Data validation procedures for input/output",
      "Anti-malware and ransomware protection",
      "Backup verification procedures",
    ],
  },
  {
    id: "POL-SEC-005",
    title: "Transmission Security Policy",
    hipaaSection: "45 CFR 164.312(e)(1)",
    category: "Technical Safeguards",
    description: "Policies for securing ePHI during electronic transmission",
    keyElements: [
      "Integrity controls for transmitted ePHI — §164.312(e)(2)(i)",
      "Encryption for ePHI in transit — §164.312(e)(2)(ii)",
      "Minimum TLS 1.2 for all external connections",
      "Encrypted email requirements for PHI (S/MIME, TLS, or portal)",
      "VPN requirements for remote access",
      "Wireless security (WPA2-Enterprise minimum)",
      "Secure file transfer protocols (SFTP, FTPS)",
      "Fax transmission procedures for PHI",
      "Prohibition of PHI via SMS/text without encryption",
    ],
  },
  {
    id: "POL-PHYS-001",
    title: "Facility Access Control Policy",
    hipaaSection: "45 CFR 164.310(a)(1)",
    category: "Physical Safeguards",
    description: "Policies for controlling physical access to ePHI systems and facilities",
    keyElements: [
      "Contingency operations facility access — §164.310(a)(2)(i)",
      "Facility security plan — §164.310(a)(2)(ii)",
      "Access control and validation procedures — §164.310(a)(2)(iii)",
      "Maintenance records — §164.310(a)(2)(iv)",
      "Badge/key access for areas with ePHI systems",
      "Visitor escort and logging procedures",
      "After-hours access procedures",
      "Server room/data center physical controls",
      "Security camera placement",
      "Alarm systems and monitoring",
    ],
  },
  {
    id: "POL-PHYS-002",
    title: "Workstation Security Policy",
    hipaaSection: "45 CFR 164.310(b)-(c)",
    category: "Physical Safeguards",
    description: "Policies for workstation use and physical security",
    keyElements: [
      "Workstation use policy — §164.310(b)",
      "Workstation security — §164.310(c)",
      "Permitted functions on workstations accessing ePHI",
      "Physical placement requirements (privacy screens, positioning)",
      "Clean desk/clear screen policy",
      "Cable locks for desktop workstations",
      "Secure storage for portable devices",
      "Auto-lock configuration (15 minutes maximum)",
      "Prohibition of personal device use for ePHI without MDM",
    ],
  },
  {
    id: "POL-PHYS-003",
    title: "Device and Media Controls Policy",
    hipaaSection: "45 CFR 164.310(d)(1)",
    category: "Physical Safeguards",
    description: "Policies for hardware and electronic media containing ePHI",
    keyElements: [
      "Disposal procedures (NIST SP 800-88) — §164.310(d)(2)(i)",
      "Media re-use procedures — §164.310(d)(2)(ii)",
      "Accountability/tracking — §164.310(d)(2)(iii)",
      "Data backup before equipment movement — §164.310(d)(2)(iv)",
      "Hardware inventory and chain of custody",
      "Encryption requirements for portable media",
      "Prohibited media types (unencrypted USB drives)",
      "Certificate of destruction requirements for disposal vendors",
      "Lost/stolen device reporting within 24 hours",
    ],
  },
  {
    id: "POL-SEC-006",
    title: "Breach Notification Policy",
    hipaaSection: "45 CFR 164.400-414",
    category: "Breach",
    description: "Policies and procedures for breach identification, assessment, and notification",
    keyElements: [
      "Definition of breach per §164.402",
      "Presumption of breach (unsecured PHI accessed, acquired, used, or disclosed)",
      "Four-factor risk assessment per HHS guidance",
      "Low probability of compromise determination",
      "Individual notification requirements (without unreasonable delay, no later than 60 days) — §164.404",
      "HHS notification (>500: within 60 days; <500: annual log) — §164.408",
      "Media notification for breaches >500 in a state — §164.406",
      "Content requirements for notification letters",
      "Breach log maintenance per §164.530(j)",
      "Business associate breach reporting requirements",
    ],
  },
  {
    id: "POL-SEC-007",
    title: "Business Associate Management Policy",
    hipaaSection: "45 CFR 164.308(b)(1) and 164.314(a)",
    category: "Administrative Safeguards",
    description: "Policies for managing business associate relationships",
    keyElements: [
      "BA identification and classification procedures",
      "BAA requirements per §164.314(a)(2)(i)",
      "Due diligence prior to engaging a BA",
      "Required BAA provisions (safeguards, reporting, subcontractors, termination)",
      "Annual BA compliance attestation",
      "BA breach notification procedures",
      "Subcontractor (downstream BA) requirements per Omnibus Rule",
      "BAA termination triggers and procedures",
      "BA risk assessment integration with SRA",
      "BA inventory maintenance",
    ],
  },
  {
    id: "POL-SEC-008",
    title: "Workforce Training Policy",
    hipaaSection: "45 CFR 164.308(a)(5)",
    category: "Administrative Safeguards",
    description: "Policies for security awareness and training programs",
    keyElements: [
      "Initial training at hire (within 30 days)",
      "Annual refresher training for all workforce",
      "Security reminders — §164.308(a)(5)(ii)(A)",
      "Malicious software protection training — §164.308(a)(5)(ii)(B)",
      "Log-in monitoring awareness — §164.308(a)(5)(ii)(C)",
      "Password management training — §164.308(a)(5)(ii)(D)",
      "Role-specific training for IT staff, managers, clinicians",
      "Phishing simulation program (monthly)",
      "Training completion tracking and documentation",
      "Retraining upon significant policy changes or security incidents",
    ],
  },
  {
    id: "POL-SEC-009",
    title: "Sanction Policy",
    hipaaSection: "45 CFR 164.308(a)(1)(ii)(C)",
    category: "Administrative Safeguards",
    description: "Policy for applying sanctions against workforce members who violate HIPAA policies",
    keyElements: [
      "Graduated sanctions (verbal warning, written warning, suspension, termination)",
      "Factors for determining sanction level (severity, intent, harm, pattern)",
      "Sanctions for unauthorized access to PHI",
      "Sanctions for unauthorized disclosure of PHI",
      "Sanctions for failure to report incidents",
      "Sanctions for sharing passwords/credentials",
      "Due process provisions",
      "Documentation and tracking of sanctions",
      "Non-retaliation protection for good-faith reporters",
      "Referral to law enforcement for criminal violations",
    ],
  },
  {
    id: "POL-SEC-010",
    title: "Incident Response Policy",
    hipaaSection: "45 CFR 164.308(a)(6)",
    category: "Administrative Safeguards",
    description: "Policies for identifying, responding to, and documenting security incidents",
    keyElements: [
      "Security incident definition per §164.304",
      "Incident identification and reporting procedures",
      "Incident response team composition and roles",
      "Response procedures (containment, eradication, recovery)",
      "Evidence preservation requirements",
      "Internal and external communication protocols",
      "Incident documentation requirements",
      "Post-incident analysis and lessons learned",
      "Integration with breach notification procedures",
      "Annual incident response testing/tabletop exercise",
    ],
  },
  {
    id: "POL-SEC-011",
    title: "Contingency Plan",
    hipaaSection: "45 CFR 164.308(a)(7)",
    category: "Administrative Safeguards",
    description: "Comprehensive contingency plan including backup, disaster recovery, and emergency mode",
    keyElements: [
      "Data backup plan (daily incremental, weekly full) — §164.308(a)(7)(ii)(A)",
      "Disaster recovery plan — §164.308(a)(7)(ii)(B)",
      "Emergency mode operation plan — §164.308(a)(7)(ii)(C)",
      "Testing and revision procedures (annual minimum) — §164.308(a)(7)(ii)(D)",
      "Applications and data criticality analysis — §164.308(a)(7)(ii)(E)",
      "Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)",
      "Off-site backup storage requirements",
      "Backup restoration testing (quarterly)",
      "Emergency access to ePHI during system outage",
      "Communication plan during emergency operations",
    ],
  },
  {
    id: "POL-PRIV-002",
    title: "Minimum Necessary Policy",
    hipaaSection: "45 CFR 164.502(b) and 164.514(d)",
    category: "Privacy",
    description: "Policy implementing the minimum necessary standard for PHI use and disclosure",
    keyElements: [
      "Minimum necessary standard — §164.502(b)(1)",
      "Exceptions (treatment, individual requests, required by law, HHS investigations)",
      "Identification of workforce needing access by role/function",
      "Conditions appropriate to restrict access by category of PHI",
      "Role-based access categories and PHI scope",
      "Routine and recurring disclosures — standard protocols",
      "Non-routine disclosures — individual review criteria",
      "Reasonable reliance on requestor representations",
      "Minimum necessary for research purposes",
      "Annual review of access levels against job functions",
    ],
  },
];

export async function generateHipaaPoliciesReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  const policyInput = extractPolicyInput(input);
  const policySummaries = generatePolicySummaries(policyInput);

  const additionalContext = buildPoliciesContext(policyInput, policySummaries);

  const rawContent = await generateReportWithLLM(
    input,
    HIPAA_POLICIES_SYSTEM_PROMPT,
    additionalContext
  );

  const sections = parseReportSections(rawContent);
  const gaps = identifyPolicyGaps(policyInput);

  return {
    title: `HIPAA Policies & Procedures Package — ${policyInput.organizationName}`,
    summary: `Complete HIPAA Policies and Procedures package for ${policyInput.organizationName} (${policyInput.organizationType}). Contains ${ALL_REQUIRED_POLICIES.length} policies covering Privacy Rule, Security Rule Administrative Safeguards, Physical Safeguards, Technical Safeguards, Breach Notification Rule, and Organizational Requirements. All policies reference specific HIPAA citations and are ready for implementation.`,
    complianceScore: calculatePolicyComplianceScore(policyInput),
    sections,
    gaps,
  };
}

function extractPolicyInput(input: ReportGenerationInput): PolicyInput {
  const records = input.extractedRecords as Array<Record<string, unknown>>;

  let ehrSystem = "Electronic Health Record System";
  for (const record of records) {
    if (record["ehrSystem"] && typeof record["ehrSystem"] === "string") {
      ehrSystem = record["ehrSystem"];
    }
  }

  // Try to get EHR from operational data
  const ehrMatch = input.operationalData.match(/(?:EHR|EMR):\s*([^\n,]+)/i);
  if (ehrMatch) {
    ehrSystem = ehrMatch[1]!.trim();
  }

  return {
    organizationName: input.facilityName,
    organizationType: mapFacilityToOrgType(input.facilityType),
    ehrSystem,
    employeeCount: input.employeeCount,
  };
}

function mapFacilityToOrgType(facilityType: string): string {
  const lower = facilityType.toLowerCase();
  if (lower.includes("hospital")) return "Hospital";
  if (lower.includes("clinic")) return "Medical Clinic";
  if (lower.includes("dental")) return "Dental Practice";
  if (lower.includes("home health")) return "Home Health Agency";
  if (lower.includes("pharmacy")) return "Pharmacy";
  if (lower.includes("nursing") || lower.includes("snf")) return "Skilled Nursing Facility";
  if (lower.includes("mental") || lower.includes("behavioral")) return "Behavioral Health Provider";
  if (lower.includes("lab")) return "Clinical Laboratory";
  return "Healthcare Provider";
}

function generatePolicySummaries(_policyInput: PolicyInput): string[] {
  return ALL_REQUIRED_POLICIES.map((policy) => {
    return `${policy.id}: ${policy.title} [${policy.hipaaSection}] — ${policy.description}. Key elements: ${policy.keyElements.slice(0, 3).join("; ")}`;
  });
}

function buildPoliciesContext(policyInput: PolicyInput, policySummaries: string[]): string {
  return `
ORGANIZATION INFORMATION:
- Name: ${policyInput.organizationName}
- Type: ${policyInput.organizationType}
- EHR System: ${policyInput.ehrSystem}
- Workforce Size: ${policyInput.employeeCount}

POLICIES TO GENERATE (${ALL_REQUIRED_POLICIES.length} total):
${policySummaries.join("\n")}

HIPAA STANDARDS REFERENCED:
Administrative Safeguards (§164.308): 9 standards
Physical Safeguards (§164.310): 4 standards
Technical Safeguards (§164.312): 5 standards
Organizational Requirements (§164.314): 2 standards
Policies and Procedures (§164.316): 2 standards

Generate a comprehensive HIPAA Policies and Procedures document that includes:
1. Policy Manual Introduction and Document Control
2. Each of the ${ALL_REQUIRED_POLICIES.length} policies listed above in full
3. Each policy must include: Purpose, Scope, Policy Statement, Procedures, Responsibilities, Sanctions, Related Policies
4. All HIPAA citations must be specific (section and paragraph level)
5. Policies must be customized to the organization type (${policyInput.organizationType})
6. Include effective dates, review schedules, and approval signatures block
7. Cross-reference policies where they interact (e.g., breach notification references incident response)`;
}

function identifyPolicyGaps(policyInput: PolicyInput): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  if (policyInput.employeeCount > 0 && policyInput.employeeCount < 10) {
    gaps.push({
      standard: "45 CFR 164.308(a)(5)",
      requirement: "Security Awareness and Training — all workforce members must receive training",
      currentState: "Small workforce size may lead to informal training without documentation",
      severity: "medium",
      recommendedAction: "Implement formal training program with documented completion records even for small workforce; use online training modules with certificates of completion",
    });
  }

  if (policyInput.organizationType === "Healthcare Provider") {
    gaps.push({
      standard: "45 CFR 164.316(a)",
      requirement: "Policies and Procedures — implement reasonable and appropriate policies",
      currentState: "Organization type not fully specified; policies may need customization once specific services are identified",
      severity: "low",
      recommendedAction: "Review and customize all policies based on specific healthcare services provided; ensure policies address all PHI workflows",
    });
  }

  // Standard gaps for any organization generating policies for the first time
  gaps.push({
    standard: "45 CFR 164.308(a)(1)(ii)(A)",
    requirement: "Risk Analysis must be conducted in conjunction with policy development",
    currentState: "Policies are being generated; concurrent risk analysis should validate policy adequacy",
    severity: "medium",
    recommendedAction: "Conduct a full Security Risk Assessment (SRA) to validate that generated policies adequately address identified risks; update policies based on SRA findings",
  });

  gaps.push({
    standard: "45 CFR 164.308(a)(5)(ii)(A)",
    requirement: "Security Reminders — periodic updates to workforce",
    currentState: "Training program requires implementation after policy adoption",
    severity: "medium",
    recommendedAction: "Upon policy adoption, immediately schedule workforce training on all new policies; implement monthly security reminders via email or bulletin board",
  });

  gaps.push({
    standard: "45 CFR 164.316(b)(2)(i)",
    requirement: "Documentation must be retained for 6 years",
    currentState: "New policies require retention program establishment",
    severity: "low",
    recommendedAction: "Establish document retention system ensuring all HIPAA policies, procedures, and related documentation are retained for minimum 6 years from creation or last effective date",
  });

  return gaps;
}

function calculatePolicyComplianceScore(policyInput: PolicyInput): number {
  // Generating all policies brings baseline compliance up significantly
  let score = 75; // Baseline for having comprehensive policies generated

  if (policyInput.employeeCount > 50) {
    score -= 5; // Larger orgs have more complexity to address
  }

  if (policyInput.organizationType === "Hospital") {
    score -= 5; // Hospitals face additional complexity
  }

  return Math.max(50, Math.min(90, score));
}

export { ALL_REQUIRED_POLICIES };
export type { PolicyDefinition, PolicyInput };
