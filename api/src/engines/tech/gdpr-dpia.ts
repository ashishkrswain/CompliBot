/**
 * GDPR Data Protection Impact Assessment (DPIA) Generator
 * Per GDPR Article 35
 */

import { generateCompletion } from "../../lib/llm.js";
import { GDPR_ARTICLES, getArticleByNumber } from "../../data/tech/gdpr-articles.js";

export interface DpiaInput {
  organizationName: string;
  dpoName: string;
  dpoContact: string;
  processingActivityName: string;
  processingDescription: string;
  purposeOfProcessing: string[];
  legalBasis: LegalBasis;
  dataCategories: DataCategory[];
  specialCategories: SpecialDataCategory[];
  dataSubjects: DataSubjectCategory[];
  recipients: DataRecipient[];
  internationalTransfers: InternationalTransfer[];
  retentionPeriod: string;
  automatedDecisionMaking: boolean;
  automatedDecisionMakingDescription: string;
  largescaleProcessing: boolean;
  systematicMonitoring: boolean;
  existingSecurityMeasures: string[];
}

export type LegalBasis =
  | "consent"
  | "contract"
  | "legal_obligation"
  | "vital_interests"
  | "public_interest"
  | "legitimate_interests";

export type DataCategory =
  | "name"
  | "email"
  | "phone"
  | "address"
  | "date_of_birth"
  | "national_id"
  | "financial"
  | "employment"
  | "location"
  | "ip_address"
  | "cookies"
  | "device_identifiers"
  | "behavioral"
  | "communications"
  | "images"
  | "other";

export type SpecialDataCategory =
  | "racial_ethnic_origin"
  | "political_opinions"
  | "religious_beliefs"
  | "trade_union"
  | "genetic"
  | "biometric"
  | "health"
  | "sex_life_orientation"
  | "criminal_convictions"
  | "none";

export interface DataSubjectCategory {
  category: string;
  estimatedNumber: string;
  vulnerableGroup: boolean;
}

export interface DataRecipient {
  name: string;
  category: string;
  purpose: string;
  legalBasis: string;
}

export interface InternationalTransfer {
  country: string;
  recipient: string;
  safeguardMechanism: TransferSafeguard;
  dataTransferred: string;
}

export type TransferSafeguard =
  | "adequacy_decision"
  | "standard_contractual_clauses"
  | "binding_corporate_rules"
  | "explicit_consent"
  | "contractual_necessity"
  | "public_interest"
  | "legal_claims"
  | "vital_interests"
  | "other";

export interface DpiaDocument {
  title: string;
  version: string;
  date: string;
  organization: string;
  dpo: { name: string; contact: string };
  sections: DpiaSection[];
  overallRiskLevel: RiskLevel;
  requiresConsultation: boolean;
  consultationReason: string;
}

export interface DpiaSection {
  sectionNumber: string;
  title: string;
  content: string;
  article35Reference: string;
}

export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export interface RiskAssessmentEntry {
  riskDescription: string;
  likelihood: RiskLevel;
  severity: RiskLevel;
  overallRisk: RiskLevel;
  mitigationMeasures: string[];
  residualRisk: RiskLevel;
}

export async function generateDpia(input: DpiaInput): Promise<DpiaDocument> {
  const sections = buildDpiaSections(input);
  const riskAssessment = assessRisks(input);
  const overallRiskLevel = determineOverallRisk(riskAssessment);
  const requiresConsultation = overallRiskLevel === "Very High";
  const consultationReason = requiresConsultation
    ? "The DPIA indicates that the processing would result in a high risk that cannot be sufficiently mitigated. Prior consultation with the supervisory authority is required per Article 36."
    : "";

  const riskSection = buildRiskAssessmentSection(riskAssessment);
  sections.push(riskSection);

  const mitigationSection = buildMitigationSection(input, riskAssessment);
  sections.push(mitigationSection);

  const consultationSection = buildConsultationSection(input, requiresConsultation, consultationReason);
  sections.push(consultationSection);

  const conclusionSection = buildConclusionSection(overallRiskLevel, requiresConsultation);
  sections.push(conclusionSection);

  const systemPrompt = `You are a GDPR Data Protection Officer reviewing a DPIA. Provide any additional recommendations for the processing activity described.`;

  const userPrompt = `Review this DPIA for ${input.processingActivityName} at ${input.organizationName}:
- Legal basis: ${input.legalBasis}
- Data categories: ${input.dataCategories.join(", ")}
- Special categories: ${input.specialCategories.filter((s) => s !== "none").join(", ") || "None"}
- Data subjects: ${input.dataSubjects.map((d) => `${d.category} (~${d.estimatedNumber})`).join(", ")}
- International transfers: ${input.internationalTransfers.length > 0 ? input.internationalTransfers.map((t) => `${t.country} via ${t.safeguardMechanism}`).join(", ") : "None"}
- Automated decision-making: ${input.automatedDecisionMaking ? "Yes" : "No"}
- Overall risk level: ${overallRiskLevel}

Provide 3-5 specific, actionable recommendations to reduce data protection risk for this processing activity. Be concise and practical.`;

  const additionalRecommendations = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 1024,
  });

  sections.push({
    sectionNumber: "8",
    title: "DPO Recommendations",
    content: additionalRecommendations,
    article35Reference: "Article 35(2) — DPO advice",
  });

  return {
    title: `Data Protection Impact Assessment — ${input.processingActivityName}`,
    version: "1.0",
    date: new Date().toISOString().split("T")[0] ?? "",
    organization: input.organizationName,
    dpo: { name: input.dpoName, contact: input.dpoContact },
    sections,
    overallRiskLevel,
    requiresConsultation,
    consultationReason,
  };
}

function buildDpiaSections(input: DpiaInput): DpiaSection[] {
  const sections: DpiaSection[] = [];

  // Section 1: Systematic description of processing operations
  sections.push({
    sectionNumber: "1",
    title: "Systematic Description of Processing Operations",
    content: buildProcessingDescription(input),
    article35Reference: "Article 35(7)(a) — Systematic description of the envisaged processing operations and purposes",
  });

  // Section 2: Purpose and Legal Basis
  sections.push({
    sectionNumber: "2",
    title: "Purpose of Processing and Legal Basis",
    content: buildPurposeAndLegalBasis(input),
    article35Reference: "Article 35(7)(a) — Purposes of processing, including where applicable the legitimate interest pursued",
  });

  // Section 3: Necessity and Proportionality
  sections.push({
    sectionNumber: "3",
    title: "Assessment of Necessity and Proportionality",
    content: buildNecessityAssessment(input),
    article35Reference: "Article 35(7)(b) — Assessment of the necessity and proportionality of the processing",
  });

  // Section 4: Data Subject Categories and Data Types
  sections.push({
    sectionNumber: "4",
    title: "Data Subjects and Personal Data Categories",
    content: buildDataSubjectsSection(input),
    article35Reference: "Article 35(7)(a) — Categories of data subjects and personal data",
  });

  return sections;
}

function buildProcessingDescription(input: DpiaInput): string {
  const transferInfo = input.internationalTransfers.length > 0
    ? `\n\n### International Transfers\n${input.internationalTransfers.map((t) =>
        `- Transfer to ${t.recipient} in ${t.country}\n  - Data transferred: ${t.dataTransferred}\n  - Safeguard mechanism: ${formatSafeguard(t.safeguardMechanism)}`
      ).join("\n")}`
    : "\n\n### International Transfers\nNo international transfers of personal data are envisaged for this processing activity.";

  const automatedInfo = input.automatedDecisionMaking
    ? `\n\n### Automated Decision-Making\nThis processing involves automated decision-making as described:\n${input.automatedDecisionMakingDescription}\n\nPer Article 22, appropriate measures are required to safeguard data subject rights including the right to obtain human intervention, express their point of view, and contest the decision.`
    : "\n\n### Automated Decision-Making\nThis processing does not involve automated individual decision-making or profiling as defined under Article 22.";

  return `### Processing Activity
**Name:** ${input.processingActivityName}

**Description:** ${input.processingDescription}

### Nature of Processing
- **Large-scale processing:** ${input.largescaleProcessing ? "Yes — this processing is conducted on a large scale" : "No"}
- **Systematic monitoring:** ${input.systematicMonitoring ? "Yes — this involves systematic monitoring of data subjects" : "No"}
- **Automated decision-making:** ${input.automatedDecisionMaking ? "Yes" : "No"}

### Data Flow
**Data Categories Collected:** ${input.dataCategories.map(formatDataCategory).join(", ")}

**Special Categories:** ${input.specialCategories.filter((s) => s !== "none").map(formatSpecialCategory).join(", ") || "No special category data is processed"}

### Recipients
${input.recipients.map((r) => `- **${r.name}** (${r.category}): ${r.purpose} — Legal basis: ${r.legalBasis}`).join("\n")}

### Retention
Personal data will be retained for: ${input.retentionPeriod}${transferInfo}${automatedInfo}`;
}

function buildPurposeAndLegalBasis(input: DpiaInput): string {
  const legalBasisDetails = getLegalBasisDescription(input.legalBasis);
  const article6Reference = getArticleByNumber(6);

  return `### Purposes of Processing
${input.purposeOfProcessing.map((p, i) => `${i + 1}. ${p}`).join("\n")}

### Legal Basis under Article 6(1)
**Selected Legal Basis:** ${legalBasisDetails.name}

**Justification:** ${legalBasisDetails.description}

**Article 6(1)(${legalBasisDetails.letter}) states:** "${legalBasisDetails.text}"

${input.legalBasis === "legitimate_interests" ? `### Legitimate Interests Assessment (Article 6(1)(f))
A Legitimate Interests Assessment (LIA) must be conducted to balance the controller's interests against the data subjects' rights and freedoms. The three-part test requires:
1. **Purpose test:** Identify the legitimate interest being pursued
2. **Necessity test:** Assess whether the processing is necessary for that purpose
3. **Balancing test:** Balance the legitimate interest against the individual's interests, rights, and freedoms

*Note: A separate LIA document should accompany this DPIA.*` : ""}

${input.specialCategories.filter((s) => s !== "none").length > 0 ? `### Additional Legal Basis for Special Category Data (Article 9)
Processing of special category data requires an additional condition under Article 9(2) to be met. The applicable condition(s) must be documented and justified.` : ""}`;
}

function buildNecessityAssessment(input: DpiaInput): string {
  const dataMinimizationAssessment = assessDataMinimization(input);

  return `### Necessity Assessment
The processing is assessed as necessary for the stated purposes based on the following analysis:

**Purpose Limitation (Article 5(1)(b)):** The personal data collected is processed solely for the specified purposes listed in Section 2. No further processing incompatible with these purposes is conducted.

**Data Minimization (Article 5(1)(c)):** ${dataMinimizationAssessment}

**Storage Limitation (Article 5(1)(e)):** Personal data is retained for ${input.retentionPeriod}. After this period, data is securely deleted or anonymized per the organization's data retention policy.

### Proportionality Assessment
The processing is assessed for proportionality considering:

1. **Could the purpose be achieved with less data?** Each data category collected serves a specific, documented purpose. ${input.dataCategories.length > 8 ? "Given the number of data categories, regular review of necessity is recommended." : "The data collected appears proportionate to the purposes."}

2. **Could the purpose be achieved with less intrusive means?** ${input.specialCategories.filter((s) => s !== "none").length > 0 ? "Special category data processing requires particular justification of proportionality." : "Standard personal data is processed using the least intrusive means practicable."}

3. **Are there adequate safeguards?** The following security measures are in place:
${input.existingSecurityMeasures.map((m) => `   - ${m}`).join("\n")}

### Data Subject Rights
Data subjects are informed of and can exercise their rights under Articles 15-22:
- Right of access (Article 15)
- Right to rectification (Article 16)
- Right to erasure (Article 17)
- Right to restriction of processing (Article 18)
- Right to data portability (Article 20)
- Right to object (Article 21)
${input.automatedDecisionMaking ? "- Right not to be subject to automated decision-making (Article 22)" : ""}`;
}

function buildDataSubjectsSection(input: DpiaInput): string {
  return `### Categories of Data Subjects
${input.dataSubjects.map((ds) => `- **${ds.category}:** Approximately ${ds.estimatedNumber} individuals${ds.vulnerableGroup ? " *(VULNERABLE GROUP — enhanced protections required)*" : ""}`).join("\n")}

${input.dataSubjects.some((ds) => ds.vulnerableGroup) ? `**Note:** This processing involves vulnerable data subjects (e.g., children, employees, patients). Per WP29 Guidelines on DPIA (wp248rev.01), this is a criterion that makes a DPIA more likely to be required and necessitates enhanced protective measures.` : ""}

### Categories of Personal Data
| Category | Examples | Sensitivity |
|----------|----------|-------------|
${input.dataCategories.map((dc) => `| ${formatDataCategory(dc)} | ${getDataCategoryExamples(dc)} | ${getDataCategorySensitivity(dc)} |`).join("\n")}

${input.specialCategories.filter((s) => s !== "none").length > 0 ? `### Special Categories of Personal Data (Article 9)
| Category | Additional Legal Basis Required |
|----------|-------------------------------|
${input.specialCategories.filter((s) => s !== "none").map((sc) => `| ${formatSpecialCategory(sc)} | Article 9(2) condition required |`).join("\n")}

**Important:** Processing of special category data requires both a legal basis under Article 6 AND a condition under Article 9(2). Both must be documented and justified.` : ""}`;
}

function buildRiskAssessmentSection(riskAssessment: RiskAssessmentEntry[]): DpiaSection {
  const riskTable = riskAssessment.map((r, i) => `### Risk ${i + 1}: ${r.riskDescription}
- **Likelihood:** ${r.likelihood}
- **Severity:** ${r.severity}
- **Overall Risk (before mitigation):** ${r.overallRisk}
- **Mitigation Measures:**
${r.mitigationMeasures.map((m) => `  - ${m}`).join("\n")}
- **Residual Risk (after mitigation):** ${r.residualRisk}
`).join("\n");

  return {
    sectionNumber: "5",
    title: "Assessment of Risks to Rights and Freedoms of Data Subjects",
    content: `This section assesses the risks that the processing poses to the rights and freedoms of data subjects, as required by Article 35(7)(c).

Risks are assessed considering:
- **Likelihood:** How likely is the risk to materialize? (Low/Medium/High/Very High)
- **Severity:** If the risk materializes, how severe would the impact be on data subjects? (Low/Medium/High/Very High)
- **Overall Risk:** Combined assessment of likelihood and severity

The following risks to data subjects' rights and freedoms have been identified:

${riskTable}`,
    article35Reference: "Article 35(7)(c) — Assessment of risks to the rights and freedoms of data subjects",
  };
}

function buildMitigationSection(input: DpiaInput, riskAssessment: RiskAssessmentEntry[]): DpiaSection {
  const existingMeasures = input.existingSecurityMeasures.map((m) => `- ${m}`).join("\n");
  const additionalMeasures = riskAssessment
    .flatMap((r) => r.mitigationMeasures)
    .filter((m, i, arr) => arr.indexOf(m) === i)
    .map((m) => `- ${m}`)
    .join("\n");

  return {
    sectionNumber: "6",
    title: "Measures to Address Risks — Safeguards, Security Measures, and Mechanisms",
    content: `Per Article 35(7)(d), this section documents the measures envisaged to address the identified risks, including safeguards, security measures, and mechanisms to ensure the protection of personal data and demonstrate compliance.

### Existing Technical and Organizational Measures
${existingMeasures}

### Additional Measures Identified Through This DPIA
${additionalMeasures}

### Organizational Safeguards
- Data protection policies and procedures documented and communicated
- Regular data protection training for all personnel processing personal data
- Data Protection Officer designated and accessible to data subjects
- Data protection by design and by default principles applied (Article 25)
- Records of processing activities maintained (Article 30)
- Data processing agreements in place with all processors (Article 28)

### Technical Safeguards
- Encryption of personal data at rest and in transit
- Access controls implementing principle of least privilege
- Logging and monitoring of access to personal data
- Regular security testing and vulnerability management
- Backup and recovery procedures for personal data
- Pseudonymization applied where feasible

### Consent and Transparency Safeguards
- Clear and comprehensive privacy notice provided to data subjects
- Consent mechanisms meeting Article 7 requirements (where applicable)
- Easy-to-use mechanisms for exercising data subject rights
- Regular review of consent validity and refresh where needed`,
    article35Reference: "Article 35(7)(d) — Measures envisaged to address risks including safeguards, security measures, and mechanisms",
  };
}

function buildConsultationSection(input: DpiaInput, requiresConsultation: boolean, reason: string): DpiaSection {
  return {
    sectionNumber: "7",
    title: "Consultation Requirements",
    content: `### DPO Consultation (Article 35(2))
The Data Protection Officer (${input.dpoName}) has been consulted on this DPIA as required by Article 35(2).

**DPO Contact:** ${input.dpoContact}

### Data Subject Views (Article 35(9))
${input.dataSubjects.some((ds) => ds.vulnerableGroup)
  ? "Given that vulnerable data subjects are involved, consideration has been given to obtaining the views of data subjects or their representatives where appropriate and without prejudice to the protection of commercial or public interests or the security of processing operations."
  : "The views of data subjects have been considered in the design of this processing activity. Where obtaining explicit views is not practical, the processing has been designed with data subject interests at the forefront."}

### Supervisory Authority Consultation (Article 36)
${requiresConsultation
  ? `**PRIOR CONSULTATION REQUIRED**

${reason}

The controller must consult the supervisory authority prior to processing, providing:
1. The respective responsibilities of the controller (and joint controllers/processors)
2. The purposes and means of the intended processing
3. The measures and safeguards to protect data subjects' rights
4. Contact details of the DPO
5. This DPIA
6. Any other information requested by the supervisory authority

The supervisory authority has up to 8 weeks to provide written advice (extendable by 6 weeks for complex cases).`
  : "Based on the assessment of residual risk following implementation of the identified mitigation measures, prior consultation with the supervisory authority under Article 36 is not required at this time. The residual risks have been reduced to an acceptable level through the documented safeguards."}`,
    article35Reference: "Article 35(2), 35(9), Article 36 — Consultation requirements",
  };
}

function buildConclusionSection(overallRiskLevel: RiskLevel, requiresConsultation: boolean): DpiaSection {
  return {
    sectionNumber: "9",
    title: "Conclusion and Decision",
    content: `### Overall Risk Assessment
**Overall residual risk level:** ${overallRiskLevel}

### Decision
${overallRiskLevel === "Very High"
  ? "The processing cannot proceed without prior consultation with the supervisory authority. The identified risks to data subjects' rights and freedoms remain at an unacceptable level despite proposed mitigation measures."
  : overallRiskLevel === "High"
  ? "The processing may proceed subject to implementation of all identified mitigation measures. The DPIA should be reviewed within 6 months to reassess residual risk levels."
  : "The processing may proceed. The identified mitigation measures adequately address the risks to data subjects' rights and freedoms. Regular review per the DPIA review schedule should continue."}

### Review Schedule
This DPIA shall be reviewed:
- Annually as part of the standard DPIA review cycle
- When there is a significant change to the processing operations
- When there is a change in the risk level (new threats, incidents, or vulnerabilities identified)
- When there is a change in the applicable legal or regulatory framework
- When the supervisory authority provides guidance relevant to this processing

### Sign-off
| Role | Name | Date | Signature |
|------|------|------|-----------|
| Data Protection Officer | ________ | ________ | ________ |
| Controller Representative | ________ | ________ | ________ |
| Processing Activity Owner | ________ | ________ | ________ |

${requiresConsultation ? "**NOTE:** This processing MUST NOT commence until supervisory authority consultation is complete." : ""}`,
    article35Reference: "Article 35(11) — Review where there is a change in the risk",
  };
}

function assessRisks(input: DpiaInput): RiskAssessmentEntry[] {
  const risks: RiskAssessmentEntry[] = [];

  // Risk: Unauthorized access to personal data
  const accessLikelihood = input.existingSecurityMeasures.length > 5 ? "Low" : "Medium";
  risks.push({
    riskDescription: "Unauthorized access to personal data (confidentiality breach)",
    likelihood: accessLikelihood as RiskLevel,
    severity: input.specialCategories.filter((s) => s !== "none").length > 0 ? "High" : "Medium",
    overallRisk: input.specialCategories.filter((s) => s !== "none").length > 0 ? "High" : "Medium",
    mitigationMeasures: [
      "Implement role-based access controls with principle of least privilege",
      "Enforce multi-factor authentication for all access to personal data",
      "Deploy encryption at rest using AES-256 or equivalent",
      "Conduct regular access reviews (quarterly minimum)",
      "Implement audit logging of all access to personal data",
    ],
    residualRisk: "Low",
  });

  // Risk: Data loss or destruction
  risks.push({
    riskDescription: "Accidental or malicious data loss or destruction (availability/integrity breach)",
    likelihood: "Medium",
    severity: input.dataSubjects.some((ds) => parseInt(ds.estimatedNumber.replace(/\D/g, "")) > 10000) ? "High" : "Medium",
    overallRisk: "Medium",
    mitigationMeasures: [
      "Implement automated backup procedures with daily frequency minimum",
      "Store backups in geographically separate location",
      "Test backup restoration quarterly",
      "Deploy ransomware protection and immutable backup storage",
      "Implement data loss prevention (DLP) controls",
    ],
    residualRisk: "Low",
  });

  // Risk: Excessive data collection (data minimization violation)
  if (input.dataCategories.length > 8) {
    risks.push({
      riskDescription: "Excessive personal data collection beyond what is necessary (data minimization violation)",
      likelihood: "Medium",
      severity: "Medium",
      overallRisk: "Medium",
      mitigationMeasures: [
        "Review each data category for strict necessity against stated purposes",
        "Implement data collection forms that collect only required fields",
        "Apply pseudonymization where full identification is not required",
        "Conduct quarterly data minimization reviews",
      ],
      residualRisk: "Low",
    });
  }

  // Risk: International transfer protections failure
  if (input.internationalTransfers.length > 0) {
    risks.push({
      riskDescription: "Inadequate protection for international data transfers (Chapter V compliance failure)",
      likelihood: "Low",
      severity: "High",
      overallRisk: "Medium",
      mitigationMeasures: [
        "Implement Standard Contractual Clauses (SCCs) with supplementary measures where required",
        "Conduct Transfer Impact Assessment (TIA) for each transfer",
        "Implement technical measures (encryption with EU-held keys) to prevent government access",
        "Monitor legal developments in recipient countries",
        "Implement contractual obligation for data importers to notify of government access requests",
      ],
      residualRisk: "Low",
    });
  }

  // Risk: Automated decision-making
  if (input.automatedDecisionMaking) {
    risks.push({
      riskDescription: "Unfair or discriminatory outcomes from automated decision-making (Article 22 compliance failure)",
      likelihood: "Medium",
      severity: "High",
      overallRisk: "High",
      mitigationMeasures: [
        "Implement human review mechanism for all significant automated decisions",
        "Conduct algorithmic fairness audits on regular basis",
        "Provide clear information to data subjects about automated decision logic",
        "Implement easy-to-use mechanism to request human intervention",
        "Document and test decision logic for bias and accuracy",
        "Maintain right to contest automated decisions",
      ],
      residualRisk: "Medium",
    });
  }

  // Risk: Vulnerable data subjects
  if (input.dataSubjects.some((ds) => ds.vulnerableGroup)) {
    risks.push({
      riskDescription: "Harm to vulnerable data subjects with reduced ability to protect their own interests",
      likelihood: "Medium",
      severity: "High",
      overallRisk: "High",
      mitigationMeasures: [
        "Apply enhanced protective measures for vulnerable group data",
        "Implement additional consent verification where applicable",
        "Provide information in accessible formats appropriate to the vulnerable group",
        "Apply stricter access controls to vulnerable group data",
        "Conduct specific risk assessment for impact on vulnerable individuals",
      ],
      residualRisk: "Medium",
    });
  }

  // Risk: Purpose limitation breach
  risks.push({
    riskDescription: "Use of personal data beyond stated purposes (purpose limitation violation)",
    likelihood: "Low",
    severity: "High",
    overallRisk: "Medium",
    mitigationMeasures: [
      "Implement technical controls preventing data access outside approved applications",
      "Require privacy impact assessment for any new use of existing data",
      "Deploy data access governance and monitoring",
      "Train personnel on purpose limitation requirements",
      "Implement data tagging linking data to its approved purposes",
    ],
    residualRisk: "Low",
  });

  // Risk: Data breach notification failure
  risks.push({
    riskDescription: "Failure to detect and notify of data breach within 72-hour timeline (Article 33 compliance failure)",
    likelihood: input.existingSecurityMeasures.some((m) => m.toLowerCase().includes("monitoring")) ? "Low" : "Medium",
    severity: "High",
    overallRisk: "Medium",
    mitigationMeasures: [
      "Implement 24/7 security monitoring and alerting",
      "Establish and test breach detection procedures",
      "Pre-draft notification templates for supervisory authority and data subjects",
      "Conduct breach response tabletop exercises quarterly",
      "Maintain data breach register per Article 33(5)",
    ],
    residualRisk: "Low",
  });

  return risks;
}

function determineOverallRisk(riskAssessment: RiskAssessmentEntry[]): RiskLevel {
  const residualRisks = riskAssessment.map((r) => r.residualRisk);
  if (residualRisks.includes("Very High")) return "Very High";
  if (residualRisks.filter((r) => r === "High").length >= 2) return "Very High";
  if (residualRisks.includes("High")) return "High";
  if (residualRisks.filter((r) => r === "Medium").length >= 3) return "High";
  if (residualRisks.includes("Medium")) return "Medium";
  return "Low";
}

function assessDataMinimization(input: DpiaInput): string {
  const categoryCount = input.dataCategories.length;
  if (categoryCount <= 4) {
    return "The processing collects a limited set of data categories, consistent with data minimization principles. Each category has been assessed as necessary for the stated purposes.";
  } else if (categoryCount <= 8) {
    return "The processing collects a moderate number of data categories. Each category has been assessed for necessity and is documented as required for at least one stated purpose. Regular review is recommended to verify continued necessity.";
  }
  return "The processing collects a relatively large number of data categories. A thorough necessity assessment should be conducted for each category to verify that all are strictly necessary for the stated purposes. Data that cannot be justified should be removed from the collection.";
}

function formatDataCategory(category: DataCategory): string {
  const names: Record<DataCategory, string> = {
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Physical Address",
    date_of_birth: "Date of Birth",
    national_id: "National Identification Number",
    financial: "Financial Data",
    employment: "Employment Information",
    location: "Location Data",
    ip_address: "IP Address",
    cookies: "Cookies/Online Identifiers",
    device_identifiers: "Device Identifiers",
    behavioral: "Behavioral/Usage Data",
    communications: "Communication Content",
    images: "Images/Photographs",
    other: "Other Personal Data",
  };
  return names[category];
}

function formatSpecialCategory(category: SpecialDataCategory): string {
  const names: Record<SpecialDataCategory, string> = {
    racial_ethnic_origin: "Racial or Ethnic Origin",
    political_opinions: "Political Opinions",
    religious_beliefs: "Religious or Philosophical Beliefs",
    trade_union: "Trade Union Membership",
    genetic: "Genetic Data",
    biometric: "Biometric Data",
    health: "Health Data",
    sex_life_orientation: "Sex Life or Sexual Orientation",
    criminal_convictions: "Criminal Convictions and Offences",
    none: "None",
  };
  return names[category];
}

function formatSafeguard(safeguard: TransferSafeguard): string {
  const names: Record<TransferSafeguard, string> = {
    adequacy_decision: "EU Adequacy Decision (Article 45)",
    standard_contractual_clauses: "Standard Contractual Clauses (Article 46(2)(c))",
    binding_corporate_rules: "Binding Corporate Rules (Article 47)",
    explicit_consent: "Explicit Consent (Article 49(1)(a))",
    contractual_necessity: "Contractual Necessity (Article 49(1)(b))",
    public_interest: "Public Interest (Article 49(1)(d))",
    legal_claims: "Legal Claims (Article 49(1)(e))",
    vital_interests: "Vital Interests (Article 49(1)(f))",
    other: "Other Mechanism",
  };
  return names[safeguard];
}

function getDataCategoryExamples(category: DataCategory): string {
  const examples: Record<DataCategory, string> = {
    name: "First name, last name, title",
    email: "Personal and business email",
    phone: "Mobile, landline numbers",
    address: "Street, city, postal code, country",
    date_of_birth: "Full date of birth",
    national_id: "SSN, passport number, national ID",
    financial: "Bank account, credit card, salary",
    employment: "Job title, employer, work history",
    location: "GPS coordinates, area/region",
    ip_address: "IPv4/IPv6 addresses",
    cookies: "Session IDs, tracking cookies",
    device_identifiers: "IMEI, device fingerprint",
    behavioral: "Click patterns, page views, preferences",
    communications: "Emails, messages, call recordings",
    images: "Profile photos, ID scans",
    other: "As described in processing description",
  };
  return examples[category];
}

function getDataCategorySensitivity(category: DataCategory): string {
  const highSensitivity: DataCategory[] = ["national_id", "financial", "communications", "location"];
  const mediumSensitivity: DataCategory[] = ["date_of_birth", "employment", "behavioral", "images", "address", "phone"];
  if (highSensitivity.includes(category)) return "High";
  if (mediumSensitivity.includes(category)) return "Medium";
  return "Standard";
}

function getLegalBasisDescription(basis: LegalBasis): { name: string; letter: string; description: string; text: string } {
  const bases: Record<LegalBasis, { name: string; letter: string; description: string; text: string }> = {
    consent: {
      name: "Consent",
      letter: "a",
      description: "The data subject has given consent to the processing of their personal data for one or more specific purposes.",
      text: "the data subject has given consent to the processing of his or her personal data for one or more specific purposes",
    },
    contract: {
      name: "Performance of a Contract",
      letter: "b",
      description: "Processing is necessary for the performance of a contract to which the data subject is party or to take steps at the request of the data subject prior to entering into a contract.",
      text: "processing is necessary for the performance of a contract to which the data subject is party or in order to take steps at the request of the data subject prior to entering into a contract",
    },
    legal_obligation: {
      name: "Legal Obligation",
      letter: "c",
      description: "Processing is necessary for compliance with a legal obligation to which the controller is subject.",
      text: "processing is necessary for compliance with a legal obligation to which the controller is subject",
    },
    vital_interests: {
      name: "Vital Interests",
      letter: "d",
      description: "Processing is necessary in order to protect the vital interests of the data subject or of another natural person.",
      text: "processing is necessary in order to protect the vital interests of the data subject or of another natural person",
    },
    public_interest: {
      name: "Public Interest",
      letter: "e",
      description: "Processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller.",
      text: "processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller",
    },
    legitimate_interests: {
      name: "Legitimate Interests",
      letter: "f",
      description: "Processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject.",
      text: "processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject which require protection of personal data, in particular where the data subject is a child",
    },
  };
  return bases[basis];
}
