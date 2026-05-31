/**
 * ISO 27001:2022 Statement of Applicability (SoA) Generator
 * Covers ALL 93 Annex A controls
 */

import { generateCompletion } from "../../lib/llm.js";
import {
  ISO27001_CONTROLS,
  getControlsByTheme,
  type Iso27001Control,
  type Iso27001Theme,
} from "../../data/tech/iso27001-controls.js";

export interface SoaInput {
  companyName: string;
  scopeDescription: string;
  industryType: string;
  employeeCount: number;
  currentSecurityMeasures: SecurityMeasureInput[];
  riskAssessmentDate: string;
  excludedActivities: string[];
}

export interface SecurityMeasureInput {
  category: string;
  description: string;
  tooling: string;
  maturityLevel: MaturityLevel;
}

export type MaturityLevel = "Not Implemented" | "Initial" | "Managed" | "Defined" | "Quantitatively Managed" | "Optimizing";

export type ImplementationStatus = "Implemented" | "Partially Implemented" | "Planned" | "Not Implemented";

export interface SoaEntry {
  controlId: string;
  controlTitle: string;
  theme: Iso27001Theme;
  applicable: boolean;
  justification: string;
  implementationStatus: ImplementationStatus;
  implementationDescription: string;
  evidenceReference: string;
  riskTreatmentReference: string;
}

export interface SoaDocument {
  title: string;
  version: string;
  date: string;
  companyName: string;
  scope: string;
  riskAssessmentDate: string;
  approvedBy: string;
  totalControls: number;
  applicableControls: number;
  excludedControls: number;
  implementationSummary: ImplementationSummary;
  entries: SoaEntry[];
  summary: string;
}

export interface ImplementationSummary {
  implemented: number;
  partiallyImplemented: number;
  planned: number;
  notImplemented: number;
  notApplicable: number;
}

export async function generateIso27001Soa(input: SoaInput): Promise<SoaDocument> {
  const entries = buildSoaEntries(input);

  const applicableEntries = entries.filter((e) => e.applicable);
  const implementationSummary = calculateImplementationSummary(entries);

  const systemPrompt = `You are an ISO 27001 Lead Auditor generating a Statement of Applicability summary.`;

  const userPrompt = `Generate a management summary for this ISO 27001:2022 Statement of Applicability:
Organization: ${input.companyName}
Scope: ${input.scopeDescription}
Industry: ${input.industryType}
Risk Assessment Date: ${input.riskAssessmentDate}
Total Controls: 93
Applicable: ${applicableEntries.length}
Excluded: ${93 - applicableEntries.length}
Implemented: ${implementationSummary.implemented}
Partially Implemented: ${implementationSummary.partiallyImplemented}
Planned: ${implementationSummary.planned}
Not Implemented: ${implementationSummary.notImplemented}

By Theme:
- Organizational (37): ${entries.filter((e) => e.theme === "Organizational" && e.applicable).length} applicable
- People (8): ${entries.filter((e) => e.theme === "People" && e.applicable).length} applicable
- Physical (14): ${entries.filter((e) => e.theme === "Physical" && e.applicable).length} applicable
- Technological (34): ${entries.filter((e) => e.theme === "Technological" && e.applicable).length} applicable

Provide a 3-paragraph management summary covering: overall applicability rationale, current implementation posture, and key gaps requiring attention for certification readiness.`;

  const summary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 1024,
  });

  return {
    title: `ISO 27001:2022 Statement of Applicability — ${input.companyName}`,
    version: "1.0",
    date: new Date().toISOString().split("T")[0] ?? "",
    companyName: input.companyName,
    scope: input.scopeDescription,
    riskAssessmentDate: input.riskAssessmentDate,
    approvedBy: "[CISO / Information Security Manager — to be signed]",
    totalControls: 93,
    applicableControls: applicableEntries.length,
    excludedControls: 93 - applicableEntries.length,
    implementationSummary,
    entries,
    summary,
  };
}

function buildSoaEntries(input: SoaInput): SoaEntry[] {
  return ISO27001_CONTROLS.map((control) => {
    const applicable = determineApplicability(control, input);
    const status = applicable ? determineImplementationStatus(control, input) : "Not Implemented" as ImplementationStatus;
    const description = applicable ? buildImplementationDescription(control, input) : "N/A — control excluded from scope";
    const justification = buildJustification(control, input, applicable);

    return {
      controlId: control.id,
      controlTitle: control.title,
      theme: control.theme,
      applicable,
      justification,
      implementationStatus: status,
      implementationDescription: description,
      evidenceReference: applicable ? getEvidenceReference(control, input) : "N/A",
      riskTreatmentReference: applicable ? getRiskTreatmentRef(control) : "N/A",
    };
  });
}

function determineApplicability(control: Iso27001Control, input: SoaInput): boolean {
  // Physical controls may not be applicable for fully remote/cloud companies
  if (control.theme === "Physical") {
    const hasPhysicalPresence = !input.excludedActivities.some((e) =>
      e.toLowerCase().includes("physical") || e.toLowerCase().includes("on-premise")
    );

    // Some physical controls always apply (storage media, equipment disposal)
    const alwaysApplicablePhysical = ["A.7.10", "A.7.14", "A.7.9"];
    if (alwaysApplicablePhysical.includes(control.id)) return true;

    return hasPhysicalPresence;
  }

  // Check explicit exclusions
  for (const exclusion of input.excludedActivities) {
    if (isControlExcludedByActivity(control, exclusion)) return false;
  }

  // All organizational, people, and technological controls are generally applicable
  return true;
}

function isControlExcludedByActivity(control: Iso27001Control, exclusion: string): boolean {
  const lowerExclusion = exclusion.toLowerCase();

  if (lowerExclusion.includes("outsourced development") && control.id === "A.8.30") return false; // keep it applicable
  if (lowerExclusion.includes("no mobile") && control.id === "A.8.1") return true;
  if (lowerExclusion.includes("no cryptography") && control.id === "A.8.24") return true;
  if (lowerExclusion.includes("no remote work") && control.id === "A.6.7") return true;

  return false;
}

function determineImplementationStatus(control: Iso27001Control, input: SoaInput): ImplementationStatus {
  const relevantMeasures = findRelevantMeasures(control, input.currentSecurityMeasures);

  if (relevantMeasures.length === 0) {
    // Check if control would naturally be partially addressed by basic security
    if (isBasicSecurityControl(control) && input.currentSecurityMeasures.length > 0) {
      return "Partially Implemented";
    }
    return "Planned";
  }

  const avgMaturity = calculateAverageMaturity(relevantMeasures);

  if (avgMaturity >= 3) return "Implemented";
  if (avgMaturity >= 2) return "Partially Implemented";
  if (avgMaturity >= 1) return "Partially Implemented";
  return "Planned";
}

function isBasicSecurityControl(control: Iso27001Control): boolean {
  const basicControls = [
    "A.5.1", "A.5.2", "A.5.4", "A.5.10", "A.5.15",
    "A.6.2", "A.6.3", "A.6.6",
    "A.8.1", "A.8.5", "A.8.7", "A.8.13",
  ];
  return basicControls.includes(control.id);
}

function findRelevantMeasures(control: Iso27001Control, measures: SecurityMeasureInput[]): SecurityMeasureInput[] {
  const controlKeywords = getControlKeywords(control);
  return measures.filter((m) => {
    const measureText = `${m.category} ${m.description} ${m.tooling}`.toLowerCase();
    return controlKeywords.some((keyword) => measureText.includes(keyword));
  });
}

function getControlKeywords(control: Iso27001Control): string[] {
  const keywordMap: Record<string, string[]> = {
    "A.5.1": ["policy", "policies", "information security policy"],
    "A.5.2": ["role", "responsibility", "isms"],
    "A.5.3": ["segregation", "separation of duties", "sod"],
    "A.5.4": ["management", "leadership", "governance"],
    "A.5.5": ["authority", "regulatory", "contact"],
    "A.5.6": ["threat intelligence", "isac", "community"],
    "A.5.7": ["threat", "intelligence", "ioc"],
    "A.5.8": ["project", "sdlc", "development lifecycle"],
    "A.5.9": ["asset", "inventory", "cmdb"],
    "A.5.10": ["acceptable use", "aup"],
    "A.5.11": ["offboarding", "return", "asset return"],
    "A.5.12": ["classification", "data classification"],
    "A.5.13": ["labeling", "label", "marking"],
    "A.5.14": ["transfer", "data transfer", "file transfer"],
    "A.5.15": ["access control", "rbac", "iam"],
    "A.5.16": ["identity", "identity management", "idp"],
    "A.5.17": ["authentication", "password", "mfa"],
    "A.5.18": ["access rights", "provisioning", "access review"],
    "A.5.19": ["supplier", "vendor", "third party"],
    "A.5.20": ["supplier agreement", "contract", "dpa"],
    "A.5.21": ["supply chain", "ict", "software supply"],
    "A.5.22": ["supplier monitoring", "vendor review"],
    "A.5.23": ["cloud", "saas", "iaas", "paas"],
    "A.5.24": ["incident", "incident management", "ir plan"],
    "A.5.25": ["event", "triage", "classification"],
    "A.5.26": ["incident response", "containment"],
    "A.5.27": ["lessons learned", "post-incident"],
    "A.5.28": ["evidence", "forensic", "chain of custody"],
    "A.5.29": ["disruption", "continuity", "resilience"],
    "A.5.30": ["business continuity", "bcp", "dr", "disaster recovery"],
    "A.5.31": ["legal", "regulatory", "compliance", "statutory"],
    "A.5.32": ["intellectual property", "ip", "license"],
    "A.5.33": ["record", "retention", "archive"],
    "A.5.34": ["privacy", "pii", "gdpr", "data protection"],
    "A.5.35": ["audit", "independent review", "assessment"],
    "A.5.36": ["compliance", "internal audit", "self-assessment"],
    "A.5.37": ["procedure", "operating procedure", "documentation"],
    "A.6.1": ["screening", "background check", "vetting"],
    "A.6.2": ["employment", "contract", "terms"],
    "A.6.3": ["awareness", "training", "education"],
    "A.6.4": ["disciplinary", "violation", "sanction"],
    "A.6.5": ["termination", "offboarding", "nda"],
    "A.6.6": ["confidentiality", "nda", "non-disclosure"],
    "A.6.7": ["remote", "telework", "work from home"],
    "A.6.8": ["reporting", "event reporting", "whistleblower"],
    "A.7.1": ["perimeter", "physical security", "fence"],
    "A.7.2": ["entry", "badge", "access card"],
    "A.7.3": ["office", "room", "secure area"],
    "A.7.4": ["cctv", "camera", "surveillance"],
    "A.7.5": ["environmental", "fire", "flood", "ups"],
    "A.7.6": ["secure area", "data center", "clean room"],
    "A.7.7": ["clear desk", "clear screen", "lock screen"],
    "A.7.8": ["equipment", "rack", "cabinet"],
    "A.7.9": ["off-site", "mobile device", "laptop"],
    "A.7.10": ["storage media", "usb", "hard drive"],
    "A.7.11": ["ups", "power", "hvac", "cooling"],
    "A.7.12": ["cable", "cabling", "network cable"],
    "A.7.13": ["maintenance", "equipment maintenance"],
    "A.7.14": ["disposal", "sanitization", "decommission"],
    "A.8.1": ["endpoint", "laptop", "mobile", "mdm"],
    "A.8.2": ["privileged", "admin", "pam", "sudo"],
    "A.8.3": ["access restriction", "authorization"],
    "A.8.4": ["source code", "repository", "git"],
    "A.8.5": ["authentication", "sso", "mfa", "2fa"],
    "A.8.6": ["capacity", "scaling", "performance"],
    "A.8.7": ["malware", "antivirus", "edr", "endpoint protection"],
    "A.8.8": ["vulnerability", "patch", "cve"],
    "A.8.9": ["configuration", "hardening", "baseline"],
    "A.8.10": ["deletion", "data deletion", "erasure"],
    "A.8.11": ["masking", "data masking", "anonymization"],
    "A.8.12": ["dlp", "data loss prevention", "exfiltration"],
    "A.8.13": ["backup", "recovery", "restore"],
    "A.8.14": ["redundancy", "failover", "high availability"],
    "A.8.15": ["log", "logging", "audit log", "siem"],
    "A.8.16": ["monitoring", "alerting", "soc"],
    "A.8.17": ["ntp", "clock", "time sync"],
    "A.8.18": ["utility", "privileged utility"],
    "A.8.19": ["software installation", "application control"],
    "A.8.20": ["network", "firewall", "network security"],
    "A.8.21": ["network service", "dns", "dhcp"],
    "A.8.22": ["segmentation", "vlan", "micro-segmentation"],
    "A.8.23": ["web filter", "proxy", "url filter"],
    "A.8.24": ["encryption", "cryptography", "kms", "tls"],
    "A.8.25": ["sdlc", "secure development", "devsecops"],
    "A.8.26": ["security requirements", "threat modeling"],
    "A.8.27": ["architecture", "design", "secure design"],
    "A.8.28": ["secure coding", "sast", "code review"],
    "A.8.29": ["security testing", "pentest", "dast"],
    "A.8.30": ["outsourced", "external development"],
    "A.8.31": ["environment separation", "dev", "staging", "prod"],
    "A.8.32": ["change management", "change control", "cab"],
    "A.8.33": ["test data", "test information"],
    "A.8.34": ["audit testing", "assurance"],
  };

  return keywordMap[control.id] ?? [control.title.toLowerCase().split(" ").slice(0, 3).join(" ")];
}

function calculateAverageMaturity(measures: SecurityMeasureInput[]): number {
  const maturityValues: Record<MaturityLevel, number> = {
    "Not Implemented": 0,
    "Initial": 1,
    "Managed": 2,
    "Defined": 3,
    "Quantitatively Managed": 4,
    "Optimizing": 5,
  };

  const total = measures.reduce((sum, m) => sum + maturityValues[m.maturityLevel], 0);
  return total / measures.length;
}

function buildImplementationDescription(control: Iso27001Control, input: SoaInput): string {
  const relevantMeasures = findRelevantMeasures(control, input.currentSecurityMeasures);

  if (relevantMeasures.length === 0) {
    return buildDefaultImplementationDescription(control, input);
  }

  const descriptions = relevantMeasures.map((m) => m.description);
  const tooling = relevantMeasures
    .filter((m) => m.tooling)
    .map((m) => m.tooling);

  let result = descriptions.join(". ");
  if (tooling.length > 0) {
    result += ` Tooling: ${tooling.join(", ")}.`;
  }

  return result;
}

function buildDefaultImplementationDescription(control: Iso27001Control, input: SoaInput): string {
  // Provide contextual default descriptions based on control theme and common practices
  const defaultDescriptions: Record<string, string> = {
    "A.5.1": `${input.companyName} maintains an Information Security Policy approved by management, reviewed annually, and communicated to all personnel.`,
    "A.5.2": "Information security roles and responsibilities are defined in the ISMS documentation and reflected in job descriptions.",
    "A.5.3": "Segregation of duties is enforced through role-based access controls and organizational structure to prevent single points of failure.",
    "A.5.7": "Threat intelligence is gathered from industry sources, vendor notifications, and security advisories to inform security decisions.",
    "A.5.9": "An asset inventory is maintained including information assets, systems, and their assigned owners, reviewed periodically.",
    "A.5.15": "Access control policy implements role-based access with least privilege principle enforced across all systems.",
    "A.5.23": "Cloud service usage follows established security requirements including due diligence, configuration standards, and ongoing monitoring.",
    "A.5.24": "Incident response plan is documented, includes roles and responsibilities, and is tested through regular exercises.",
    "A.5.30": "Business continuity and disaster recovery plans are maintained and tested to ensure critical services can recover within defined objectives.",
    "A.6.3": "Security awareness training is provided to all personnel upon hire and annually, covering policies, threats, and responsibilities.",
    "A.8.5": "Authentication mechanisms include multi-factor authentication for privileged and remote access, with password complexity requirements.",
    "A.8.7": "Endpoint protection is deployed across all managed devices with real-time detection and centralized management.",
    "A.8.8": "Vulnerability management program includes regular scanning, risk-based prioritization, and defined remediation timelines.",
    "A.8.13": "Data backups are performed automatically per defined schedules with integrity verification and periodic restoration testing.",
    "A.8.15": "Security-relevant events are logged across systems with centralized collection and monitoring for anomalous activity.",
    "A.8.24": "Cryptographic controls include TLS for data in transit and AES-256 for data at rest, with key management through dedicated KMS.",
    "A.8.25": "Secure development lifecycle includes security requirements, code review, security testing, and secure deployment practices.",
  };

  return defaultDescriptions[control.id] ?? `Implementation planned to address ${control.title} requirements. Details to be documented during implementation phase.`;
}

function buildJustification(control: Iso27001Control, input: SoaInput, applicable: boolean): string {
  if (!applicable) {
    if (control.theme === "Physical" && input.excludedActivities.some((e) => e.toLowerCase().includes("physical"))) {
      return `Excluded — ${input.companyName} operates fully in the cloud with no owned physical facilities requiring this control. Physical security of cloud infrastructure is managed by the cloud service provider and validated through their SOC 2 reports.`;
    }
    return `Excluded — this control is not applicable to ${input.companyName}'s operations based on the risk assessment conducted on ${input.riskAssessmentDate}. The associated risk is either not present or is fully transferred to a third party with appropriate contractual controls.`;
  }

  return `Applicable — required to address information security risks identified in the risk assessment. This control supports ${input.companyName}'s information security objectives and is within the ISMS scope: ${input.scopeDescription}.`;
}

function getEvidenceReference(control: Iso27001Control, input: SoaInput): string {
  const evidenceMap: Record<Iso27001Theme, string[]> = {
    Organizational: [
      "Policy documents with version history",
      "Management review minutes",
      "Risk assessment records",
      "Audit reports",
      "Process documentation",
    ],
    People: [
      "HR records",
      "Training completion records",
      "Employment contracts",
      "Awareness test results",
      "Background check records",
    ],
    Physical: [
      "Access logs",
      "CCTV recordings",
      "Visitor registers",
      "Maintenance records",
      "Environmental monitoring logs",
    ],
    Technological: [
      "System configuration screenshots",
      "Tool dashboard exports",
      "Scan reports",
      "Architecture diagrams",
      "Change management records",
    ],
  };

  const themeEvidence = evidenceMap[control.theme];
  return themeEvidence.slice(0, 3).join("; ");
}

function getRiskTreatmentRef(control: Iso27001Control): string {
  return `RT-${control.id.replace("A.", "")}`;
}

function calculateImplementationSummary(entries: SoaEntry[]): ImplementationSummary {
  return {
    implemented: entries.filter((e) => e.applicable && e.implementationStatus === "Implemented").length,
    partiallyImplemented: entries.filter((e) => e.applicable && e.implementationStatus === "Partially Implemented").length,
    planned: entries.filter((e) => e.applicable && e.implementationStatus === "Planned").length,
    notImplemented: entries.filter((e) => e.applicable && e.implementationStatus === "Not Implemented").length,
    notApplicable: entries.filter((e) => !e.applicable).length,
  };
}

export function formatSoaAsTable(document: SoaDocument): string {
  let output = `# ${document.title}\n\n`;
  output += `**Version:** ${document.version} | **Date:** ${document.date} | **Approved By:** ${document.approvedBy}\n\n`;
  output += `**Scope:** ${document.scope}\n\n`;
  output += `**Risk Assessment Date:** ${document.riskAssessmentDate}\n\n`;
  output += `## Summary\n\n`;
  output += `| Metric | Count |\n|--------|-------|\n`;
  output += `| Total Controls (ISO 27001:2022 Annex A) | ${document.totalControls} |\n`;
  output += `| Applicable | ${document.applicableControls} |\n`;
  output += `| Not Applicable | ${document.excludedControls} |\n`;
  output += `| Implemented | ${document.implementationSummary.implemented} |\n`;
  output += `| Partially Implemented | ${document.implementationSummary.partiallyImplemented} |\n`;
  output += `| Planned | ${document.implementationSummary.planned} |\n`;
  output += `| Not Implemented | ${document.implementationSummary.notImplemented} |\n\n`;

  const themes: Iso27001Theme[] = ["Organizational", "People", "Physical", "Technological"];

  for (const theme of themes) {
    const themeEntries = document.entries.filter((e) => e.theme === theme);
    output += `## ${theme} Controls\n\n`;
    output += `| Control ID | Title | Applicable | Status | Justification |\n`;
    output += `|------------|-------|------------|--------|---------------|\n`;

    for (const entry of themeEntries) {
      output += `| ${entry.controlId} | ${entry.controlTitle} | ${entry.applicable ? "Yes" : "No"} | ${entry.implementationStatus} | ${entry.justification.slice(0, 80)}... |\n`;
    }

    output += `\n`;
  }

  return output;
}
