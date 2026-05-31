/**
 * FedRAMP (Federal Risk and Authorization Management Program) Assessment Engine
 * Generates authorization package analysis, baseline recommendations, control family
 * assessments, SSP structure, and POA&M items per NIST SP 800-53 Rev 5.
 *
 * Baselines: Low (125 controls), Moderate (325 controls), High (421 controls)
 * Control Families: AC, AT, AU, CA, CM, CP, IA, IR, MA, MP, PE, PL, PM, PS, RA, SA, SC, SI
 */

import { generateCompletion } from "../../lib/llm.js";

// ─── Constants ───────────────────────────────────────────────────────────────

export const FEDRAMP_BASELINES = {
  Low: { label: "FedRAMP Low", controlCount: 125 },
  Moderate: { label: "FedRAMP Moderate", controlCount: 325 },
  High: { label: "FedRAMP High", controlCount: 421 },
} as const;

export type FedRampBaseline = keyof typeof FEDRAMP_BASELINES;

export type DeploymentModel = "Public" | "Private" | "Community" | "Hybrid";

export type ServiceModel = "IaaS" | "PaaS" | "SaaS";

export type ControlFamilyId =
  | "AC" | "AT" | "AU" | "CA" | "CM" | "CP"
  | "IA" | "IR" | "MA" | "MP" | "PE" | "PL"
  | "PM" | "PS" | "RA" | "SA" | "SC" | "SI";

export const CONTROL_FAMILIES: Record<ControlFamilyId, ControlFamilyDefinition> = {
  AC: { id: "AC", name: "Access Control", lowCount: 17, moderateCount: 45, highCount: 57 },
  AT: { id: "AT", name: "Awareness and Training", lowCount: 4, moderateCount: 5, highCount: 5 },
  AU: { id: "AU", name: "Audit and Accountability", lowCount: 10, moderateCount: 16, highCount: 21 },
  CA: { id: "CA", name: "Assessment, Authorization, and Monitoring", lowCount: 7, moderateCount: 11, highCount: 13 },
  CM: { id: "CM", name: "Configuration Management", lowCount: 8, moderateCount: 16, highCount: 20 },
  CP: { id: "CP", name: "Contingency Planning", lowCount: 8, moderateCount: 14, highCount: 18 },
  IA: { id: "IA", name: "Identification and Authentication", lowCount: 8, moderateCount: 17, highCount: 21 },
  IR: { id: "IR", name: "Incident Response", lowCount: 7, moderateCount: 11, highCount: 14 },
  MA: { id: "MA", name: "Maintenance", lowCount: 4, moderateCount: 7, highCount: 9 },
  MP: { id: "MP", name: "Media Protection", lowCount: 4, moderateCount: 8, highCount: 10 },
  PE: { id: "PE", name: "Physical and Environmental Protection", lowCount: 10, moderateCount: 17, highCount: 22 },
  PL: { id: "PL", name: "Planning", lowCount: 4, moderateCount: 6, highCount: 7 },
  PM: { id: "PM", name: "Program Management", lowCount: 8, moderateCount: 16, highCount: 16 },
  PS: { id: "PS", name: "Personnel Security", lowCount: 7, moderateCount: 8, highCount: 9 },
  RA: { id: "RA", name: "Risk Assessment", lowCount: 5, moderateCount: 7, highCount: 9 },
  SA: { id: "SA", name: "System and Services Acquisition", lowCount: 9, moderateCount: 19, highCount: 24 },
  SC: { id: "SC", name: "System and Communications Protection", lowCount: 9, moderateCount: 28, highCount: 38 },
  SI: { id: "SI", name: "System and Information Integrity", lowCount: 6, moderateCount: 14, highCount: 18 },
};

export const ALL_CONTROL_FAMILY_IDS: ControlFamilyId[] = [
  "AC", "AT", "AU", "CA", "CM", "CP", "IA", "IR",
  "MA", "MP", "PE", "PL", "PM", "PS", "RA", "SA", "SC", "SI",
];

export type DataSensitivity =
  | "publicly-available"
  | "low-sensitivity-pii"
  | "moderate-sensitivity-pii"
  | "high-sensitivity-pii"
  | "phi"
  | "cui"
  | "classified"
  | "financial"
  | "law-enforcement"
  | "critical-infrastructure";

// ─── Input Interfaces ─────────────────────────────────────────────────────────

export interface FedRampInput {
  cspName: string;
  systemName: string;
  systemDescription: string;
  dataTypes: DataSensitivity[];
  deploymentModel: DeploymentModel;
  serviceModel: ServiceModel;
  existingAuthorizations: ExistingAuthorization[];
  controlsImplemented: ControlImplementation[];
}

export interface ExistingAuthorization {
  framework: string;
  level: string;
  grantDate: string;
  expirationDate: string;
  authorizingBody: string;
  scope: string;
}

export interface ControlImplementation {
  controlId: string;
  familyId: ControlFamilyId;
  status: ControlImplementationStatus;
  implementationDetails: string;
  responsibleRole: string;
  evidenceArtifacts: string[];
  lastAssessedDate: string;
  inherited: boolean;
  inheritedFrom: string | null;
}

export type ControlImplementationStatus =
  | "implemented"
  | "partially-implemented"
  | "planned"
  | "alternative"
  | "not-applicable"
  | "not-implemented";

// ─── Output Interfaces ────────────────────────────────────────────────────────

export interface FedRampAssessment {
  cspName: string;
  systemName: string;
  generatedDate: string;
  recommendedBaseline: BaselineRecommendation;
  controlFamilyStatuses: ControlFamilyStatus[];
  systemSecurityPlan: SystemSecurityPlan;
  poamItems: PoamItem[];
  estimatedTimeline: AuthorizationTimeline;
  riskSummary: RiskSummary;
  executiveSummary: string;
}

export interface BaselineRecommendation {
  baseline: FedRampBaseline;
  rationale: string[];
  dataTypeJustification: string;
  alternativeConsiderations: string[];
  totalControlsRequired: number;
  controlsCurrentlyMet: number;
  controlGapCount: number;
  compliancePercentage: number;
}

export interface ControlFamilyStatus {
  familyId: ControlFamilyId;
  familyName: string;
  totalControls: number;
  implemented: number;
  partiallyImplemented: number;
  planned: number;
  notImplemented: number;
  notApplicable: number;
  alternative: number;
  compliancePercentage: number;
  status: FamilyComplianceStatus;
  criticalGaps: string[];
  recommendations: string[];
}

export type FamilyComplianceStatus =
  | "fully-compliant"
  | "substantially-compliant"
  | "partially-compliant"
  | "minimally-compliant"
  | "non-compliant";

export interface SystemSecurityPlan {
  systemIdentification: SystemIdentification;
  systemEnvironment: SystemEnvironment;
  securityObjectives: SecurityObjectives;
  authorizationBoundary: AuthorizationBoundary;
  controlSummaries: ControlFamilySspSection[];
  continuousMonitoring: ContinuousMonitoringStrategy;
}

export interface SystemIdentification {
  systemName: string;
  systemAbbreviation: string;
  systemVersion: string;
  cspName: string;
  serviceModel: ServiceModel;
  deploymentModel: DeploymentModel;
  leveragedAuthorizations: string[];
  systemDescription: string;
  systemFunction: string;
  informationTypes: string[];
  securityCategorization: string;
}

export interface SystemEnvironment {
  hardwareInventory: string;
  softwareInventory: string;
  networkArchitecture: string;
  dataFlowDescription: string;
  ports: string;
  interconnections: string[];
}

export interface SecurityObjectives {
  confidentiality: ImpactLevel;
  integrity: ImpactLevel;
  availability: ImpactLevel;
  overallCategorization: FedRampBaseline;
}

export type ImpactLevel = "Low" | "Moderate" | "High";

export interface AuthorizationBoundary {
  description: string;
  components: BoundaryComponent[];
  externalConnections: ExternalConnection[];
  dataFlows: DataFlow[];
}

export interface BoundaryComponent {
  name: string;
  type: string;
  description: string;
  inBoundary: boolean;
}

export interface ExternalConnection {
  name: string;
  organization: string;
  connectionType: string;
  direction: "inbound" | "outbound" | "bidirectional";
  securityMeasures: string[];
}

export interface DataFlow {
  source: string;
  destination: string;
  dataType: string;
  protocol: string;
  encryptionMethod: string;
}

export interface ControlFamilySspSection {
  familyId: ControlFamilyId;
  familyName: string;
  narrative: string;
  keyControls: SspControlEntry[];
}

export interface SspControlEntry {
  controlId: string;
  title: string;
  implementationStatus: ControlImplementationStatus;
  responsibleRole: string;
  implementationNarrative: string;
  parameterValues: string[];
}

export interface ContinuousMonitoringStrategy {
  monitoringFrequency: string;
  automatedTools: string[];
  vulnerabilityScanningCadence: string;
  penetrationTestingCadence: string;
  poamReviewCadence: string;
  significantChangeThreshold: string;
  annualAssessmentScope: string;
}

export interface PoamItem {
  poamId: string;
  controlId: string;
  familyId: ControlFamilyId;
  weakness: string;
  severity: PoamSeverity;
  relevanceOfThreat: "High" | "Moderate" | "Low";
  milestones: PoamMilestone[];
  scheduledCompletionDate: string;
  resourcesRequired: string;
  vendorDependency: boolean;
  riskAcceptance: boolean;
  deviationRationale: string;
  status: PoamStatus;
  recommendedAction: string;
  estimatedCost: string;
}

export type PoamSeverity = "Critical" | "High" | "Moderate" | "Low" | "Very Low";

export type PoamStatus = "Open" | "In Progress" | "Delayed" | "Completed" | "Risk Accepted";

export interface PoamMilestone {
  milestoneNumber: number;
  description: string;
  targetDate: string;
  status: "Not Started" | "In Progress" | "Completed";
}

export interface AuthorizationTimeline {
  readinessAssessmentWeeks: number;
  fullAssessmentWeeks: number;
  authorizationDecisionWeeks: number;
  totalWeeks: number;
  phases: TimelinePhase[];
  keyDependencies: string[];
  riskFactors: string[];
}

export interface TimelinePhase {
  phaseNumber: number;
  name: string;
  description: string;
  durationWeeks: number;
  activities: string[];
  deliverables: string[];
  dependencies: string[];
}

export interface RiskSummary {
  overallRiskLevel: "Critical" | "High" | "Moderate" | "Low";
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  moderateFindings: number;
  lowFindings: number;
  topRiskAreas: RiskArea[];
  mitigationPriorities: string[];
  residualRiskStatement: string;
}

export interface RiskArea {
  area: string;
  riskLevel: "Critical" | "High" | "Moderate" | "Low";
  description: string;
  affectedControls: string[];
  recommendedMitigation: string;
}

export interface ControlFamilyDefinition {
  id: ControlFamilyId;
  name: string;
  lowCount: number;
  moderateCount: number;
  highCount: number;
}

// ─── Main Generator Function ──────────────────────────────────────────────────

export async function generateFedRampAssessment(input: FedRampInput): Promise<FedRampAssessment> {
  const recommendedBaseline = determineBaseline(input);
  const controlFamilyStatuses = assessControlFamilies(input, recommendedBaseline.baseline);
  const ssp = buildSystemSecurityPlan(input, recommendedBaseline.baseline, controlFamilyStatuses);
  const poamItems = generatePoamItems(input, controlFamilyStatuses, recommendedBaseline.baseline);
  const estimatedTimeline = buildAuthorizationTimeline(input, recommendedBaseline, poamItems);
  const riskSummary = buildRiskSummary(controlFamilyStatuses, poamItems);

  const systemPrompt = `You are a FedRAMP Third Party Assessment Organization (3PAO) assessor providing an executive summary of a FedRAMP authorization readiness assessment. Reference NIST SP 800-53 Rev 5 controls, FedRAMP requirements, and provide actionable recommendations. Be precise and use federal compliance terminology.`;

  const userPrompt = `Provide a 3-4 paragraph executive summary for this FedRAMP readiness assessment:

CSP: ${input.cspName}
System: ${input.systemName}
System Description: ${input.systemDescription}
Service Model: ${input.serviceModel}
Deployment Model: ${input.deploymentModel}
Recommended Baseline: ${recommendedBaseline.baseline} (${FEDRAMP_BASELINES[recommendedBaseline.baseline].controlCount} controls)
Data Types: ${input.dataTypes.join(", ")}
Existing Authorizations: ${input.existingAuthorizations.map((a) => `${a.framework} ${a.level}`).join(", ") || "None"}
Overall Compliance: ${recommendedBaseline.compliancePercentage}% (${recommendedBaseline.controlsCurrentlyMet}/${recommendedBaseline.totalControlsRequired} controls met)
Control Gap Count: ${recommendedBaseline.controlGapCount}
Critical POA&M Items: ${poamItems.filter((p) => p.severity === "Critical").length}
High POA&M Items: ${poamItems.filter((p) => p.severity === "High").length}
Estimated Timeline: ${estimatedTimeline.totalWeeks} weeks
Overall Risk Level: ${riskSummary.overallRiskLevel}
Top Risk Areas: ${riskSummary.topRiskAreas.map((r) => r.area).join(", ")}

Address: authorization readiness posture, most critical gaps requiring remediation before 3PAO assessment, strengths leveraged from existing authorizations, and recommended path to ATO (Agency ATO vs JAB P-ATO).`;

  const executiveSummary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 2048,
  });

  return {
    cspName: input.cspName,
    systemName: input.systemName,
    generatedDate: new Date().toISOString().split("T")[0] ?? "",
    recommendedBaseline,
    controlFamilyStatuses,
    systemSecurityPlan: ssp,
    poamItems,
    estimatedTimeline,
    riskSummary,
    executiveSummary,
  };
}

// ─── Baseline Determination ──────────────────────────────────────────────────

function determineBaseline(input: FedRampInput): BaselineRecommendation {
  const { dataTypes } = input;
  const rationale: string[] = [];
  const alternativeConsiderations: string[] = [];

  let baseline: FedRampBaseline = "Low";
  let dataTypeJustification = "";

  const highSensitivityTypes: DataSensitivity[] = [
    "high-sensitivity-pii",
    "classified",
    "law-enforcement",
    "critical-infrastructure",
  ];
  const moderateSensitivityTypes: DataSensitivity[] = [
    "moderate-sensitivity-pii",
    "phi",
    "cui",
    "financial",
  ];
  const lowSensitivityTypes: DataSensitivity[] = [
    "publicly-available",
    "low-sensitivity-pii",
  ];

  const hasHighData = dataTypes.some((dt) => highSensitivityTypes.includes(dt));
  const hasModerateData = dataTypes.some((dt) => moderateSensitivityTypes.includes(dt));
  const hasLowOnlyData = dataTypes.every((dt) => lowSensitivityTypes.includes(dt));

  if (hasHighData) {
    baseline = "High";
    const highTypes = dataTypes.filter((dt) => highSensitivityTypes.includes(dt));
    dataTypeJustification = `System processes ${highTypes.join(", ")} data requiring High impact categorization per FIPS 199 and NIST SP 800-60.`;
    rationale.push("Data types include high-impact information categories requiring maximum protection.");
    rationale.push("FIPS 199 categorization: Confidentiality=High, Integrity=High, Availability=High.");
    rationale.push("FedRAMP High baseline mandated for systems where loss could cause severe/catastrophic adverse effects.");
    alternativeConsiderations.push("No lower baseline is appropriate for the identified data types.");
    alternativeConsiderations.push("JAB P-ATO at High baseline provides broadest agency reuse potential.");
  } else if (hasModerateData) {
    baseline = "Moderate";
    const modTypes = dataTypes.filter((dt) => moderateSensitivityTypes.includes(dt));
    dataTypeJustification = `System processes ${modTypes.join(", ")} data requiring Moderate impact categorization per FIPS 199 and NIST SP 800-60.`;
    rationale.push("Data types include moderate-impact information categories (PII, PHI, CUI, or financial data).");
    rationale.push("FIPS 199 categorization: at least one security objective at Moderate impact level.");
    rationale.push("FedRAMP Moderate baseline is the most common authorization level (~80% of FedRAMP authorizations).");
    alternativeConsiderations.push("If any agency requires High impact categorization for any security objective, escalate to High baseline.");
    alternativeConsiderations.push("Consider FedRAMP Tailored (Li-SaaS) only if system is low-risk SaaS with limited data.");
  } else if (hasLowOnlyData) {
    baseline = "Low";
    dataTypeJustification = `System processes only publicly available or low-sensitivity data requiring Low impact categorization per FIPS 199.`;
    rationale.push("All data types are low-sensitivity with limited adverse impact if compromised.");
    rationale.push("FIPS 199 categorization: Confidentiality=Low, Integrity=Low, Availability=Low.");
    rationale.push("FedRAMP Low baseline appropriate for systems where loss would have limited adverse effect.");
    alternativeConsiderations.push("Consider FedRAMP Tailored (Li-SaaS) if system qualifies as low-impact SaaS.");
    alternativeConsiderations.push("If agency data sensitivity requirements change, reassess for Moderate baseline.");
  } else {
    baseline = "Moderate";
    dataTypeJustification = "Unable to definitively categorize data types; defaulting to Moderate as conservative baseline.";
    rationale.push("Data classification is ambiguous; Moderate baseline selected as conservative default.");
    rationale.push("Recommend formal FIPS 199 categorization exercise with sponsoring agency.");
    alternativeConsiderations.push("Work with sponsoring agency to confirm categorization before finalizing baseline.");
  }

  if (input.existingAuthorizations.length > 0) {
    rationale.push(`Existing authorizations (${input.existingAuthorizations.map((a) => a.framework).join(", ")}) may accelerate FedRAMP assessment through control inheritance and reciprocity.`);
  }

  const totalControlsRequired = FEDRAMP_BASELINES[baseline].controlCount;
  const controlsCurrentlyMet = countImplementedControls(input.controlsImplemented, baseline);
  const controlGapCount = totalControlsRequired - controlsCurrentlyMet;
  const compliancePercentage = totalControlsRequired > 0
    ? Math.round((controlsCurrentlyMet / totalControlsRequired) * 100)
    : 0;

  return {
    baseline,
    rationale,
    dataTypeJustification,
    alternativeConsiderations,
    totalControlsRequired,
    controlsCurrentlyMet,
    controlGapCount,
    compliancePercentage,
  };
}

function countImplementedControls(controls: ControlImplementation[], baseline: FedRampBaseline): number {
  const applicableControls = controls.filter((c) => isControlInBaseline(c.controlId, c.familyId, baseline));
  return applicableControls.filter(
    (c) => c.status === "implemented" || c.status === "not-applicable"
  ).length;
}

function isControlInBaseline(controlId: string, familyId: ControlFamilyId, baseline: FedRampBaseline): boolean {
  const family = CONTROL_FAMILIES[familyId];
  const controlNumber = extractControlNumber(controlId);

  switch (baseline) {
    case "Low":
      return controlNumber <= family.lowCount;
    case "Moderate":
      return controlNumber <= family.moderateCount;
    case "High":
      return controlNumber <= family.highCount;
  }
}

function extractControlNumber(controlId: string): number {
  const match = controlId.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// ─── Control Family Assessment ───────────────────────────────────────────────

function assessControlFamilies(input: FedRampInput, baseline: FedRampBaseline): ControlFamilyStatus[] {
  return ALL_CONTROL_FAMILY_IDS.map((familyId) => assessControlFamily(familyId, input, baseline));
}

function assessControlFamily(
  familyId: ControlFamilyId,
  input: FedRampInput,
  baseline: FedRampBaseline
): ControlFamilyStatus {
  const family = CONTROL_FAMILIES[familyId];
  const totalControls = getControlCountForBaseline(family, baseline);

  const familyControls = input.controlsImplemented.filter((c) => c.familyId === familyId);
  const applicableControls = familyControls.filter((c) => isControlInBaseline(c.controlId, familyId, baseline));

  let implemented = 0;
  let partiallyImplemented = 0;
  let planned = 0;
  let notImplemented = 0;
  let notApplicable = 0;
  let alternative = 0;

  for (const control of applicableControls) {
    switch (control.status) {
      case "implemented":
        implemented++;
        break;
      case "partially-implemented":
        partiallyImplemented++;
        break;
      case "planned":
        planned++;
        break;
      case "not-implemented":
        notImplemented++;
        break;
      case "not-applicable":
        notApplicable++;
        break;
      case "alternative":
        alternative++;
        break;
    }
  }

  const unaccountedControls = totalControls - applicableControls.length;
  notImplemented += unaccountedControls;

  const effectiveTotal = totalControls - notApplicable;
  const effectiveCompliant = implemented + alternative;
  const compliancePercentage = effectiveTotal > 0
    ? Math.round((effectiveCompliant / effectiveTotal) * 100)
    : 100;

  const status = determineFamilyStatus(compliancePercentage);
  const criticalGaps = identifyCriticalGaps(familyId, input.controlsImplemented, baseline);
  const recommendations = generateFamilyRecommendations(familyId, status, compliancePercentage, baseline);

  return {
    familyId,
    familyName: family.name,
    totalControls,
    implemented,
    partiallyImplemented,
    planned,
    notImplemented,
    notApplicable,
    alternative,
    compliancePercentage,
    status,
    criticalGaps,
    recommendations,
  };
}

function getControlCountForBaseline(family: ControlFamilyDefinition, baseline: FedRampBaseline): number {
  switch (baseline) {
    case "Low":
      return family.lowCount;
    case "Moderate":
      return family.moderateCount;
    case "High":
      return family.highCount;
  }
}

function determineFamilyStatus(percentage: number): FamilyComplianceStatus {
  if (percentage >= 100) return "fully-compliant";
  if (percentage >= 80) return "substantially-compliant";
  if (percentage >= 60) return "partially-compliant";
  if (percentage >= 30) return "minimally-compliant";
  return "non-compliant";
}

function identifyCriticalGaps(
  familyId: ControlFamilyId,
  controls: ControlImplementation[],
  baseline: FedRampBaseline
): string[] {
  const criticalControlsMap: Record<ControlFamilyId, string[]> = {
    AC: ["AC-2", "AC-3", "AC-6", "AC-7", "AC-17"],
    AT: ["AT-2", "AT-3"],
    AU: ["AU-2", "AU-3", "AU-6", "AU-12"],
    CA: ["CA-2", "CA-5", "CA-7"],
    CM: ["CM-2", "CM-3", "CM-6", "CM-7"],
    CP: ["CP-2", "CP-9", "CP-10"],
    IA: ["IA-2", "IA-4", "IA-5", "IA-8"],
    IR: ["IR-2", "IR-4", "IR-5", "IR-6"],
    MA: ["MA-2", "MA-4"],
    MP: ["MP-2", "MP-4", "MP-6"],
    PE: ["PE-2", "PE-3", "PE-6"],
    PL: ["PL-2", "PL-4"],
    PM: ["PM-2", "PM-6", "PM-9"],
    PS: ["PS-3", "PS-4", "PS-5"],
    RA: ["RA-3", "RA-5"],
    SA: ["SA-3", "SA-4", "SA-8", "SA-9"],
    SC: ["SC-7", "SC-8", "SC-12", "SC-13", "SC-28"],
    SI: ["SI-2", "SI-3", "SI-4", "SI-5"],
  };

  const criticalControls = criticalControlsMap[familyId] ?? [];
  const gaps: string[] = [];

  for (const criticalId of criticalControls) {
    const controlNumber = extractControlNumber(criticalId);
    const familyDef = CONTROL_FAMILIES[familyId];
    const maxForBaseline = getControlCountForBaseline(familyDef, baseline);

    if (controlNumber > maxForBaseline) continue;

    const found = controls.find((c) => c.controlId === criticalId && c.familyId === familyId);
    if (!found || found.status === "not-implemented" || found.status === "planned") {
      gaps.push(`${criticalId}: ${getCriticalControlDescription(criticalId)}`);
    }
  }

  return gaps;
}

function getCriticalControlDescription(controlId: string): string {
  const descriptions: Record<string, string> = {
    "AC-2": "Account Management — lifecycle management of information system accounts",
    "AC-3": "Access Enforcement — enforcing approved authorizations for logical access",
    "AC-6": "Least Privilege — employing principle of least privilege",
    "AC-7": "Unsuccessful Logon Attempts — limiting consecutive invalid attempts",
    "AC-17": "Remote Access — establishing and controlling remote access sessions",
    "AT-2": "Literacy Training and Awareness — role-based security awareness",
    "AT-3": "Role-Based Training — specialized security training for assigned roles",
    "AU-2": "Event Logging — defining auditable events for the system",
    "AU-3": "Content of Audit Records — content requirements for generated records",
    "AU-6": "Audit Record Review, Analysis, and Reporting — review and analysis of records",
    "AU-12": "Audit Record Generation — generating records for defined auditable events",
    "CA-2": "Control Assessments — assessing security controls for effectiveness",
    "CA-5": "Plan of Action and Milestones — developing and maintaining POA&Ms",
    "CA-7": "Continuous Monitoring — establishing continuous monitoring strategy",
    "CM-2": "Baseline Configuration — establishing and maintaining baseline configurations",
    "CM-3": "Configuration Change Control — managing changes to the system",
    "CM-6": "Configuration Settings — establishing and documenting mandatory settings",
    "CM-7": "Least Functionality — restricting system to required capabilities only",
    "CP-2": "Contingency Plan — developing comprehensive contingency plan",
    "CP-9": "System Backup — conducting backups of system-level and user-level information",
    "CP-10": "System Recovery and Reconstitution — recovery and reconstitution to known state",
    "IA-2": "Identification and Authentication (Organizational Users) — uniquely identifying users",
    "IA-4": "Identifier Management — managing system identifiers",
    "IA-5": "Authenticator Management — managing system authenticators",
    "IA-8": "Identification and Authentication (Non-Organizational Users) — identifying external users",
    "IR-2": "Incident Response Training — training personnel in incident response roles",
    "IR-4": "Incident Handling — implementing incident handling capability",
    "IR-5": "Incident Monitoring — tracking and documenting incidents",
    "IR-6": "Incident Reporting — reporting incidents per requirements",
    "MA-2": "Controlled Maintenance — scheduling and performing maintenance",
    "MA-4": "Nonlocal Maintenance — authorizing nonlocal maintenance activities",
    "MP-2": "Media Access — restricting access to media containing system information",
    "MP-4": "Media Storage — physically controlling and securely storing media",
    "MP-6": "Media Sanitization — sanitizing media prior to disposal or reuse",
    "PE-2": "Physical Access Authorizations — developing and maintaining authorization lists",
    "PE-3": "Physical Access Control — enforcing physical access authorizations at entry points",
    "PE-6": "Monitoring Physical Access — monitoring physical access to detect intrusions",
    "PL-2": "System Security and Privacy Plans — developing security plans",
    "PL-4": "Rules of Behavior — establishing rules of behavior for system users",
    "PM-2": "Information Security Program Leadership Role — appointing senior official",
    "PM-6": "Measures of Performance — developing and monitoring security measures",
    "PM-9": "Risk Management Strategy — developing comprehensive risk management strategy",
    "PS-3": "Personnel Screening — screening individuals prior to system access",
    "PS-4": "Personnel Termination — upon termination revoking access and retrieving assets",
    "PS-5": "Personnel Transfer — reviewing and confirming ongoing access eligibility",
    "RA-3": "Risk Assessment — conducting organizational risk assessments",
    "RA-5": "Vulnerability Monitoring and Scanning — scanning for vulnerabilities",
    "SA-3": "System Development Life Cycle — managing system using SDLC",
    "SA-4": "Acquisition Process — including security requirements in acquisitions",
    "SA-8": "Security and Privacy Engineering Principles — applying engineering principles",
    "SA-9": "External System Services — requiring service providers meet security requirements",
    "SC-7": "Boundary Protection — monitoring and controlling communications at system boundary",
    "SC-8": "Transmission Confidentiality and Integrity — protecting transmitted information",
    "SC-12": "Cryptographic Key Establishment and Management — managing cryptographic keys",
    "SC-13": "Cryptographic Protection — implementing FIPS-validated cryptography",
    "SC-28": "Protection of Information at Rest — protecting information at rest",
    "SI-2": "Flaw Remediation — identifying and correcting flaws",
    "SI-3": "Malicious Code Protection — implementing malicious code protection",
    "SI-4": "System Monitoring — monitoring system to detect attacks and anomalies",
    "SI-5": "Security Alerts, Advisories, and Directives — receiving and acting on alerts",
  };

  return descriptions[controlId] ?? "Control implementation required per NIST SP 800-53 Rev 5";
}

function generateFamilyRecommendations(
  familyId: ControlFamilyId,
  status: FamilyComplianceStatus,
  percentage: number,
  baseline: FedRampBaseline
): string[] {
  const recommendations: string[] = [];

  if (status === "fully-compliant") {
    recommendations.push(`${familyId} family is fully compliant. Maintain continuous monitoring and evidence collection.`);
    return recommendations;
  }

  const familyRecommendations: Record<ControlFamilyId, string[]> = {
    AC: [
      "Implement role-based access control (RBAC) with least privilege enforcement",
      "Deploy MFA for all privileged and remote access per IA-2 enhancements",
      "Establish automated account provisioning/deprovisioning workflows",
      "Implement session controls including timeout, lock, and concurrent session limits",
    ],
    AT: [
      "Develop role-based security awareness training program aligned to NIST guidelines",
      "Implement annual training with phishing simulation exercises",
      "Document training completion records for all system personnel",
    ],
    AU: [
      "Deploy centralized SIEM with automated correlation and alerting",
      "Configure comprehensive audit logging for all CUI/sensitive data access",
      "Establish log review cadence (real-time alerting + daily/weekly reviews)",
      "Ensure 90-day online retention and 1-year total retention per FedRAMP requirements",
    ],
    CA: [
      "Develop Plan of Action and Milestones (POA&M) management process",
      "Establish continuous monitoring strategy aligned to FedRAMP ConMon requirements",
      "Schedule annual control assessments with qualified assessors",
    ],
    CM: [
      "Establish and document baseline configurations for all system components",
      "Implement automated configuration monitoring and drift detection",
      "Deploy change management process with security impact analysis",
      "Implement application whitelisting and least functionality per CM-7",
    ],
    CP: [
      "Develop comprehensive contingency plan with BIA, RTO, and RPO targets",
      "Implement and test backup strategy (full and incremental)",
      "Conduct annual contingency plan testing (tabletop + functional)",
      "Establish alternate processing site per FedRAMP requirements",
    ],
    IA: [
      "Implement FIPS 140-2/140-3 validated MFA for all organizational users",
      "Deploy PIV/CAC support for federal personnel access",
      "Establish automated authenticator management (password complexity, rotation, lifecycle)",
      "Implement federation for external user authentication where applicable",
    ],
    IR: [
      "Develop incident response plan covering US-CERT reporting timelines",
      "Establish 24/7 incident detection and response capability",
      "Conduct annual IR plan testing (tabletop + simulation)",
      "Implement automated incident detection integrated with SIEM",
    ],
    MA: [
      "Establish controlled maintenance procedures with proper authorization",
      "Implement remote maintenance session controls (logging, termination, MFA)",
      "Document approved maintenance tools and media sanitization procedures",
    ],
    MP: [
      "Implement media encryption for all portable/removable media",
      "Establish media sanitization procedures (NIST SP 800-88 compliant)",
      "Deploy DLP controls to prevent unauthorized data exfiltration",
    ],
    PE: [
      "Implement layered physical access controls (badges, biometrics, mantraps)",
      "Deploy video surveillance with 90-day retention at all entry points",
      "Establish visitor management procedures with escorts in restricted areas",
      "Implement environmental controls (fire suppression, HVAC, water detection)",
    ],
    PL: [
      "Develop comprehensive System Security Plan (SSP) per FedRAMP template",
      "Establish rules of behavior with annual acknowledgment",
      "Document security architecture with authorization boundary definition",
    ],
    PM: [
      "Appoint Information System Security Officer (ISSO) and security team",
      "Develop enterprise risk management strategy aligned to NIST RMF",
      "Establish security metrics program with quarterly reporting",
      "Implement insider threat program per PM-12",
    ],
    PS: [
      "Implement personnel screening commensurate with data sensitivity",
      "Establish same-day access revocation for terminated personnel",
      "Implement personnel transfer procedures with access review",
    ],
    RA: [
      "Conduct comprehensive risk assessment using NIST SP 800-30 methodology",
      "Implement automated vulnerability scanning (monthly internal, external)",
      "Establish vulnerability remediation SLAs (Critical: 30 days, High: 60 days, Moderate: 90 days)",
    ],
    SA: [
      "Integrate security requirements into SDLC and acquisition processes",
      "Require supply chain risk management documentation from vendors",
      "Implement secure coding practices with static/dynamic analysis",
      "Establish service provider monitoring per SA-9 requirements",
    ],
    SC: [
      "Deploy FIPS 140-2/140-3 validated encryption for data in transit and at rest",
      "Implement boundary protection with DMZ, WAF, and IDS/IPS",
      "Configure DNSSEC, TLS 1.2+ enforcement, and certificate management",
      "Implement network segmentation and zero-trust architecture principles",
    ],
    SI: [
      "Deploy automated patch management with defined remediation timelines",
      "Implement endpoint detection and response (EDR) across all system components",
      "Establish continuous monitoring for unauthorized changes and anomalies",
      "Configure automated malicious code protection with real-time updates",
    ],
  };

  const familyRecs = familyRecommendations[familyId] ?? [];

  if (percentage < 30) {
    recommendations.push(`CRITICAL: ${CONTROL_FAMILIES[familyId].name} family requires immediate comprehensive remediation for ${baseline} baseline.`);
    recommendations.push(...familyRecs);
  } else if (percentage < 60) {
    recommendations.push(`${CONTROL_FAMILIES[familyId].name} family has significant gaps requiring focused remediation effort.`);
    recommendations.push(...familyRecs.slice(0, 3));
  } else if (percentage < 80) {
    recommendations.push(`${CONTROL_FAMILIES[familyId].name} family is partially compliant. Address remaining gaps to achieve substantial compliance.`);
    recommendations.push(...familyRecs.slice(0, 2));
  } else {
    recommendations.push(`${CONTROL_FAMILIES[familyId].name} family is substantially compliant. Close remaining minor gaps for full compliance.`);
    recommendations.push(familyRecs[0] ?? "Maintain current controls and evidence collection.");
  }

  return recommendations;
}

// ─── System Security Plan ────────────────────────────────────────────────────

function buildSystemSecurityPlan(
  input: FedRampInput,
  baseline: FedRampBaseline,
  familyStatuses: ControlFamilyStatus[]
): SystemSecurityPlan {
  const securityObjectives = deriveSecurityObjectives(baseline);
  const systemIdentification = buildSystemIdentification(input, baseline, securityObjectives);
  const systemEnvironment = buildSystemEnvironment(input);
  const authorizationBoundary = buildAuthorizationBoundary(input);
  const controlSummaries = buildControlSummaries(input, familyStatuses);
  const continuousMonitoring = buildContinuousMonitoringStrategy(baseline);

  return {
    systemIdentification,
    systemEnvironment,
    securityObjectives,
    authorizationBoundary,
    controlSummaries,
    continuousMonitoring,
  };
}

function deriveSecurityObjectives(baseline: FedRampBaseline): SecurityObjectives {
  switch (baseline) {
    case "High":
      return { confidentiality: "High", integrity: "High", availability: "High", overallCategorization: "High" };
    case "Moderate":
      return { confidentiality: "Moderate", integrity: "Moderate", availability: "Moderate", overallCategorization: "Moderate" };
    case "Low":
      return { confidentiality: "Low", integrity: "Low", availability: "Low", overallCategorization: "Low" };
  }
}

function buildSystemIdentification(
  input: FedRampInput,
  baseline: FedRampBaseline,
  objectives: SecurityObjectives
): SystemIdentification {
  const abbreviation = input.systemName
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return {
    systemName: input.systemName,
    systemAbbreviation: abbreviation,
    systemVersion: "1.0",
    cspName: input.cspName,
    serviceModel: input.serviceModel,
    deploymentModel: input.deploymentModel,
    leveragedAuthorizations: input.existingAuthorizations.map((a) => `${a.framework} ${a.level} (${a.authorizingBody})`),
    systemDescription: input.systemDescription,
    systemFunction: `${input.serviceModel} offering providing ${input.systemDescription}`,
    informationTypes: input.dataTypes.map((dt) => formatDataType(dt)),
    securityCategorization: `${baseline} — C:${objectives.confidentiality} / I:${objectives.integrity} / A:${objectives.availability}`,
  };
}

function formatDataType(dataType: DataSensitivity): string {
  const typeLabels: Record<DataSensitivity, string> = {
    "publicly-available": "Publicly Available Information",
    "low-sensitivity-pii": "Low-Sensitivity PII (Name, Business Contact)",
    "moderate-sensitivity-pii": "Moderate-Sensitivity PII (SSN, DOB, Financial)",
    "high-sensitivity-pii": "High-Sensitivity PII (Biometric, Medical, Legal)",
    "phi": "Protected Health Information (PHI / HIPAA)",
    "cui": "Controlled Unclassified Information (CUI / NARA Registry)",
    "classified": "Classified National Security Information",
    "financial": "Sensitive Financial Information (FTI, Banking)",
    "law-enforcement": "Law Enforcement Sensitive (LES)",
    "critical-infrastructure": "Critical Infrastructure Information (CII)",
  };
  return typeLabels[dataType];
}

function buildSystemEnvironment(input: FedRampInput): SystemEnvironment {
  return {
    hardwareInventory: `[CSP to provide comprehensive hardware inventory for ${input.systemName} including all servers, network devices, storage, and endpoints within the authorization boundary]`,
    softwareInventory: `[CSP to provide complete software inventory including OS, middleware, applications, and third-party components with version numbers]`,
    networkArchitecture: `${input.deploymentModel} cloud deployment using ${input.serviceModel} service model. Network architecture must be documented with diagrams showing segmentation, boundary devices, and data flows.`,
    dataFlowDescription: `[CSP to document all data flows including data types (${input.dataTypes.join(", ")}), protocols, encryption methods, and boundary crossings]`,
    ports: "[CSP to enumerate all ports, protocols, and services used by the system with justification for each]",
    interconnections: input.existingAuthorizations.length > 0
      ? input.existingAuthorizations.map((a) => `${a.framework} authorized system (${a.scope})`)
      : ["[CSP to identify all system interconnections including ISAs/MOUs]"],
  };
}

function buildAuthorizationBoundary(input: FedRampInput): AuthorizationBoundary {
  const components: BoundaryComponent[] = [
    {
      name: `${input.systemName} Application Layer`,
      type: "Application",
      description: `Primary ${input.serviceModel} application components providing core service functionality`,
      inBoundary: true,
    },
    {
      name: `${input.systemName} Data Layer`,
      type: "Database/Storage",
      description: "Data storage and processing components handling all system data types",
      inBoundary: true,
    },
    {
      name: "Network Infrastructure",
      type: "Network",
      description: "Virtual network components including load balancers, firewalls, and routing",
      inBoundary: true,
    },
    {
      name: "Management Plane",
      type: "Management",
      description: "Administrative interfaces, monitoring, and orchestration services",
      inBoundary: true,
    },
    {
      name: "Underlying Cloud Infrastructure",
      type: "IaaS Provider",
      description: "Physical infrastructure provided by underlying cloud service provider (if applicable)",
      inBoundary: input.serviceModel === "IaaS",
    },
  ];

  const externalConnections: ExternalConnection[] = [
    {
      name: "Agency User Access",
      organization: "Federal Agency Customers",
      connectionType: "HTTPS/TLS 1.2+",
      direction: "inbound",
      securityMeasures: ["TLS 1.2+ encryption", "MFA authentication", "WAF protection", "DDoS mitigation"],
    },
    {
      name: "CSP Administrative Access",
      organization: input.cspName,
      connectionType: "Encrypted VPN / Bastion",
      direction: "inbound",
      securityMeasures: ["MFA required", "Jump server/bastion host", "Session recording", "Least privilege"],
    },
  ];

  const dataFlows: DataFlow[] = [
    {
      source: "Federal Users",
      destination: `${input.systemName} Application`,
      dataType: input.dataTypes.join(", "),
      protocol: "HTTPS (TLS 1.2+)",
      encryptionMethod: "FIPS 140-2 validated TLS",
    },
    {
      source: `${input.systemName} Application`,
      destination: `${input.systemName} Data Store`,
      dataType: "Processed data, metadata",
      protocol: "Internal encrypted connection",
      encryptionMethod: "AES-256 (FIPS 140-2 validated)",
    },
  ];

  return {
    description: `The authorization boundary for ${input.systemName} encompasses all ${input.serviceModel} components operated by ${input.cspName} within the ${input.deploymentModel} cloud deployment model. The boundary includes all hardware, software, network, and data components required to deliver the service to federal agency customers.`,
    components,
    externalConnections,
    dataFlows,
  };
}

function buildControlSummaries(
  input: FedRampInput,
  familyStatuses: ControlFamilyStatus[]
): ControlFamilySspSection[] {
  return familyStatuses.map((familyStatus) => {
    const familyControls = input.controlsImplemented.filter((c) => c.familyId === familyStatus.familyId);

    const keyControls: SspControlEntry[] = familyControls
      .filter((c) => c.status === "implemented" || c.status === "partially-implemented")
      .slice(0, 5)
      .map((c) => ({
        controlId: c.controlId,
        title: getCriticalControlDescription(c.controlId),
        implementationStatus: c.status,
        responsibleRole: c.responsibleRole,
        implementationNarrative: c.implementationDetails,
        parameterValues: [],
      }));

    const narrative = generateFamilyNarrative(familyStatus);

    return {
      familyId: familyStatus.familyId,
      familyName: familyStatus.familyName,
      narrative,
      keyControls,
    };
  });
}

function generateFamilyNarrative(familyStatus: ControlFamilyStatus): string {
  const { familyId, familyName, compliancePercentage, implemented, totalControls, status } = familyStatus;

  if (status === "fully-compliant") {
    return `The ${familyName} (${familyId}) control family is fully implemented with ${implemented} of ${totalControls} controls in place. All required security measures are operational and subject to continuous monitoring.`;
  }

  if (status === "substantially-compliant") {
    return `The ${familyName} (${familyId}) control family is substantially implemented at ${compliancePercentage}% (${implemented}/${totalControls} controls). Remaining gaps are tracked in the POA&M and scheduled for remediation prior to 3PAO assessment.`;
  }

  return `The ${familyName} (${familyId}) control family is at ${compliancePercentage}% compliance (${implemented}/${totalControls} controls implemented). Significant implementation effort is required. Key gaps and remediation actions are documented in the POA&M.`;
}

function buildContinuousMonitoringStrategy(baseline: FedRampBaseline): ContinuousMonitoringStrategy {
  const isHigh = baseline === "High";
  const isModerate = baseline === "Moderate";

  return {
    monitoringFrequency: "Ongoing with monthly reporting to FedRAMP PMO",
    automatedTools: [
      "Vulnerability Scanner (Qualys/Tenable/Rapid7)",
      "SIEM (Splunk/Sentinel/Chronicle)",
      "Configuration Management Database (CMDB)",
      "Endpoint Detection and Response (EDR)",
      "Cloud Security Posture Management (CSPM)",
    ],
    vulnerabilityScanningCadence: isHigh
      ? "Weekly (OS/infrastructure) + Monthly (web application/database)"
      : isModerate
        ? "Monthly (OS/infrastructure) + Quarterly (web application)"
        : "Monthly internal, quarterly external",
    penetrationTestingCadence: isHigh ? "Annually (full scope) + after significant changes" : "Annually",
    poamReviewCadence: "Monthly review with FedRAMP PMO reporting",
    significantChangeThreshold: "Changes affecting security posture, boundary, data flows, or interconnections require Security Impact Analysis (SIA) and potential reassessment",
    annualAssessmentScope: isHigh
      ? "Full reassessment of all High baseline controls annually"
      : "1/3 of controls assessed annually (full coverage over 3-year authorization cycle)",
  };
}

// ─── POA&M Generation ────────────────────────────────────────────────────────

function generatePoamItems(
  input: FedRampInput,
  familyStatuses: ControlFamilyStatus[],
  baseline: FedRampBaseline
): PoamItem[] {
  const poamItems: PoamItem[] = [];
  let poamCounter = 1;

  for (const familyStatus of familyStatuses) {
    if (familyStatus.status === "fully-compliant") continue;

    const familyControls = input.controlsImplemented.filter((c) => c.familyId === familyStatus.familyId);
    const nonCompliantControls = familyControls.filter(
      (c) =>
        isControlInBaseline(c.controlId, c.familyId, baseline) &&
        (c.status === "not-implemented" || c.status === "partially-implemented" || c.status === "planned")
    );

    for (const control of nonCompliantControls) {
      const severity = determinePoamSeverity(control, familyStatus.familyId);
      const milestones = generatePoamMilestones(control, severity);
      const scheduledDate = calculateScheduledCompletion(severity);

      poamItems.push({
        poamId: `POAM-${String(poamCounter).padStart(4, "0")}`,
        controlId: control.controlId,
        familyId: control.familyId,
        weakness: buildWeaknessDescription(control),
        severity,
        relevanceOfThreat: mapSeverityToThreatRelevance(severity),
        milestones,
        scheduledCompletionDate: scheduledDate,
        resourcesRequired: estimateResources(severity, control.familyId),
        vendorDependency: isVendorDependent(control.controlId),
        riskAcceptance: false,
        deviationRationale: "",
        status: control.status === "planned" ? "In Progress" : "Open",
        recommendedAction: getRecommendedAction(control.controlId, control.familyId),
        estimatedCost: estimateCost(severity, control.familyId),
      });

      poamCounter++;
    }

    if (familyStatus.criticalGaps.length > 0 && nonCompliantControls.length === 0) {
      for (const gap of familyStatus.criticalGaps) {
        const controlId = gap.split(":")[0]?.trim() ?? "";
        poamItems.push({
          poamId: `POAM-${String(poamCounter).padStart(4, "0")}`,
          controlId,
          familyId: familyStatus.familyId,
          weakness: `${controlId} not implemented: ${gap.split(":")[1]?.trim() ?? "Control not addressed"}`,
          severity: "High",
          relevanceOfThreat: "High",
          milestones: [
            { milestoneNumber: 1, description: `Assess current state of ${controlId}`, targetDate: getDateOffset(14), status: "Not Started" },
            { milestoneNumber: 2, description: `Implement ${controlId} control measures`, targetDate: getDateOffset(60), status: "Not Started" },
            { milestoneNumber: 3, description: `Validate and document ${controlId} implementation`, targetDate: getDateOffset(75), status: "Not Started" },
          ],
          scheduledCompletionDate: getDateOffset(90),
          resourcesRequired: "Security engineering team, potential tooling acquisition",
          vendorDependency: false,
          riskAcceptance: false,
          deviationRationale: "",
          status: "Open",
          recommendedAction: getRecommendedAction(controlId, familyStatus.familyId),
          estimatedCost: "$25,000 - $75,000",
        });
        poamCounter++;
      }
    }
  }

  return poamItems.sort((a, b) => {
    const severityOrder: Record<PoamSeverity, number> = { Critical: 0, High: 1, Moderate: 2, Low: 3, "Very Low": 4 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function determinePoamSeverity(control: ControlImplementation, familyId: ControlFamilyId): PoamSeverity {
  const criticalFamilies: ControlFamilyId[] = ["AC", "IA", "SC", "SI"];
  const highFamilies: ControlFamilyId[] = ["AU", "CM", "CP", "IR", "RA"];

  if (control.status === "not-implemented") {
    if (criticalFamilies.includes(familyId)) return "Critical";
    if (highFamilies.includes(familyId)) return "High";
    return "Moderate";
  }

  if (control.status === "partially-implemented") {
    if (criticalFamilies.includes(familyId)) return "High";
    if (highFamilies.includes(familyId)) return "Moderate";
    return "Low";
  }

  if (control.status === "planned") {
    if (criticalFamilies.includes(familyId)) return "Moderate";
    return "Low";
  }

  return "Low";
}

function mapSeverityToThreatRelevance(severity: PoamSeverity): "High" | "Moderate" | "Low" {
  switch (severity) {
    case "Critical":
    case "High":
      return "High";
    case "Moderate":
      return "Moderate";
    case "Low":
    case "Very Low":
      return "Low";
  }
}

function generatePoamMilestones(control: ControlImplementation, severity: PoamSeverity): PoamMilestone[] {
  const milestones: PoamMilestone[] = [];
  const baseOffset = severity === "Critical" ? 7 : severity === "High" ? 14 : 21;

  if (control.status === "not-implemented") {
    milestones.push({
      milestoneNumber: 1,
      description: `Complete gap assessment and requirements definition for ${control.controlId}`,
      targetDate: getDateOffset(baseOffset),
      status: "Not Started",
    });
    milestones.push({
      milestoneNumber: 2,
      description: `Design and procure solution for ${control.controlId} implementation`,
      targetDate: getDateOffset(baseOffset * 2),
      status: "Not Started",
    });
    milestones.push({
      milestoneNumber: 3,
      description: `Implement and configure ${control.controlId} controls in non-production`,
      targetDate: getDateOffset(baseOffset * 3),
      status: "Not Started",
    });
    milestones.push({
      milestoneNumber: 4,
      description: `Deploy to production and validate ${control.controlId} effectiveness`,
      targetDate: getDateOffset(baseOffset * 4),
      status: "Not Started",
    });
    milestones.push({
      milestoneNumber: 5,
      description: `Document evidence artifacts and update SSP for ${control.controlId}`,
      targetDate: getDateOffset(baseOffset * 4 + 7),
      status: "Not Started",
    });
  } else if (control.status === "partially-implemented") {
    milestones.push({
      milestoneNumber: 1,
      description: `Identify specific gaps in current ${control.controlId} implementation`,
      targetDate: getDateOffset(baseOffset),
      status: "Not Started",
    });
    milestones.push({
      milestoneNumber: 2,
      description: `Implement missing aspects of ${control.controlId}`,
      targetDate: getDateOffset(baseOffset * 2),
      status: "Not Started",
    });
    milestones.push({
      milestoneNumber: 3,
      description: `Validate complete implementation and collect evidence for ${control.controlId}`,
      targetDate: getDateOffset(baseOffset * 3),
      status: "Not Started",
    });
  } else {
    milestones.push({
      milestoneNumber: 1,
      description: `Finalize implementation plan for ${control.controlId}`,
      targetDate: getDateOffset(baseOffset),
      status: "In Progress",
    });
    milestones.push({
      milestoneNumber: 2,
      description: `Execute implementation and collect evidence for ${control.controlId}`,
      targetDate: getDateOffset(baseOffset * 2),
      status: "Not Started",
    });
  }

  return milestones;
}

function buildWeaknessDescription(control: ControlImplementation): string {
  const statusDescriptions: Record<ControlImplementationStatus, string> = {
    "implemented": "Control is implemented",
    "partially-implemented": `${control.controlId} is partially implemented. ${control.implementationDetails || "Full implementation required to meet FedRAMP baseline requirements."}`,
    "planned": `${control.controlId} implementation is planned but not yet deployed. ${control.implementationDetails || "Requires implementation per FedRAMP baseline."}`,
    "alternative": "Alternative implementation in place",
    "not-applicable": "Not applicable to this system",
    "not-implemented": `${control.controlId} is not implemented. This control is required by the FedRAMP baseline and must be addressed to achieve authorization.`,
  };

  return statusDescriptions[control.status];
}

function calculateScheduledCompletion(severity: PoamSeverity): string {
  const daysMap: Record<PoamSeverity, number> = {
    Critical: 30,
    High: 60,
    Moderate: 90,
    Low: 120,
    "Very Low": 180,
  };
  return getDateOffset(daysMap[severity]);
}

function estimateResources(severity: PoamSeverity, familyId: ControlFamilyId): string {
  const technicalFamilies: ControlFamilyId[] = ["AC", "AU", "CM", "IA", "SC", "SI"];
  const isTechnical = technicalFamilies.includes(familyId);

  if (severity === "Critical" || severity === "High") {
    return isTechnical
      ? "Security engineering team (2-3 FTE), potential tooling/platform investment, management oversight"
      : "Security operations team (1-2 FTE), policy/process development resources";
  }
  if (severity === "Moderate") {
    return isTechnical
      ? "Security engineer (1 FTE), potential tool configuration changes"
      : "Compliance analyst (1 FTE), documentation effort";
  }
  return "Part-time compliance analyst, documentation updates";
}

function isVendorDependent(controlId: string): boolean {
  const vendorDependentControls = [
    "SC-7", "SC-8", "SC-13", "SC-28",
    "SI-3", "SI-4",
    "AU-6", "AU-12",
    "PE-2", "PE-3", "PE-6",
    "MA-4",
  ];
  return vendorDependentControls.includes(controlId);
}

function getRecommendedAction(controlId: string, familyId: ControlFamilyId): string {
  const actionMap: Record<string, string> = {
    "AC-2": "Implement automated account lifecycle management with approval workflows and periodic access reviews",
    "AC-3": "Deploy attribute-based or role-based access control enforcement mechanism across all system components",
    "AC-6": "Implement least privilege with separation of duties; audit and reduce existing privileged access",
    "AC-7": "Configure account lockout after defined number of failed attempts with automated alerts",
    "AC-17": "Implement encrypted remote access with MFA, session monitoring, and logging",
    "AU-2": "Define comprehensive list of auditable events aligned to FedRAMP requirements and NIST SP 800-92",
    "AU-6": "Deploy SIEM with automated correlation rules, alerts, and defined review cadence",
    "CA-7": "Establish continuous monitoring program with automated scanning, reporting, and POA&M management",
    "CM-2": "Document and maintain baseline configurations using automated configuration management tools",
    "CM-6": "Implement CIS Benchmarks or DISA STIGs as configuration settings baseline",
    "CP-2": "Develop BCP/DR plan with defined RTO/RPO; test annually with tabletop and functional exercises",
    "CP-9": "Implement automated backup with encryption, integrity verification, and regular restoration testing",
    "IA-2": "Deploy FIPS 140-2 validated MFA for all organizational users accessing the system",
    "IA-5": "Implement authenticator management per NIST SP 800-63B guidelines",
    "IR-4": "Establish incident handling capability with playbooks, automation, and US-CERT reporting integration",
    "RA-5": "Deploy automated vulnerability scanning with defined remediation timelines and exception management",
    "SC-7": "Implement boundary protection with next-gen firewall, IDS/IPS, and network segmentation",
    "SC-13": "Deploy FIPS 140-2/140-3 validated cryptographic modules for all encryption functions",
    "SC-28": "Implement AES-256 encryption for all data at rest within the authorization boundary",
    "SI-2": "Establish automated patch management with SLA-based remediation (30/60/90 days by severity)",
    "SI-4": "Deploy system monitoring with behavioral analytics, anomaly detection, and automated alerting",
  };

  const action = actionMap[controlId];
  if (action) return action;

  const familyActions: Record<ControlFamilyId, string> = {
    AC: "Implement access control measures per NIST SP 800-53 Rev 5 AC family requirements",
    AT: "Develop and deliver role-based security training program with documented completion tracking",
    AU: "Implement comprehensive audit logging and monitoring per FedRAMP requirements",
    CA: "Establish assessment and authorization processes aligned to NIST RMF",
    CM: "Implement configuration management program with automated monitoring and change control",
    CP: "Develop and test contingency capabilities including backup, recovery, and alternate processing",
    IA: "Implement identification and authentication controls with FIPS-validated mechanisms",
    IR: "Establish incident response program with detection, handling, and reporting capabilities",
    MA: "Implement controlled maintenance procedures with proper authorization and logging",
    MP: "Deploy media protection controls including encryption, sanitization, and access restrictions",
    PE: "Implement physical and environmental protection controls per FedRAMP baseline",
    PL: "Develop comprehensive security planning documentation per FedRAMP SSP template",
    PM: "Establish information security program management with defined roles and metrics",
    PS: "Implement personnel security controls including screening, termination, and transfer procedures",
    RA: "Conduct risk assessments and vulnerability scanning per NIST SP 800-30 methodology",
    SA: "Integrate security into system development lifecycle and acquisition processes",
    SC: "Implement communications protection with FIPS-validated cryptography and boundary controls",
    SI: "Deploy system integrity controls including patching, malware protection, and monitoring",
  };

  return familyActions[familyId];
}

function estimateCost(severity: PoamSeverity, familyId: ControlFamilyId): string {
  const technicalFamilies: ControlFamilyId[] = ["AC", "AU", "CM", "IA", "SC", "SI"];
  const isTechnical = technicalFamilies.includes(familyId);

  switch (severity) {
    case "Critical":
      return isTechnical ? "$75,000 - $200,000" : "$25,000 - $75,000";
    case "High":
      return isTechnical ? "$50,000 - $150,000" : "$15,000 - $50,000";
    case "Moderate":
      return isTechnical ? "$25,000 - $75,000" : "$10,000 - $30,000";
    case "Low":
      return isTechnical ? "$10,000 - $30,000" : "$5,000 - $15,000";
    case "Very Low":
      return "$5,000 - $10,000";
  }
}

function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0] ?? "";
}

// ─── Authorization Timeline ──────────────────────────────────────────────────

function buildAuthorizationTimeline(
  input: FedRampInput,
  baselineRec: BaselineRecommendation,
  poamItems: PoamItem[]
): AuthorizationTimeline {
  const criticalCount = poamItems.filter((p) => p.severity === "Critical").length;
  const highCount = poamItems.filter((p) => p.severity === "High").length;
  const gapPercentage = 100 - baselineRec.compliancePercentage;

  let readinessWeeks: number;
  let assessmentWeeks: number;
  let decisionWeeks: number;

  if (gapPercentage <= 10) {
    readinessWeeks = 8;
    assessmentWeeks = 6;
    decisionWeeks = 4;
  } else if (gapPercentage <= 25) {
    readinessWeeks = 16;
    assessmentWeeks = 8;
    decisionWeeks = 6;
  } else if (gapPercentage <= 50) {
    readinessWeeks = 26;
    assessmentWeeks = 10;
    decisionWeeks = 8;
  } else {
    readinessWeeks = 40;
    assessmentWeeks = 12;
    decisionWeeks = 10;
  }

  if (criticalCount > 5) readinessWeeks += 8;
  if (highCount > 10) readinessWeeks += 4;
  if (input.existingAuthorizations.length > 0) readinessWeeks = Math.max(8, readinessWeeks - 6);

  const totalWeeks = readinessWeeks + assessmentWeeks + decisionWeeks;

  const phases = buildTimelinePhases(input, readinessWeeks, assessmentWeeks, decisionWeeks, baselineRec);
  const keyDependencies = identifyKeyDependencies(input, poamItems);
  const riskFactors = identifyTimelineRiskFactors(baselineRec, poamItems);

  return {
    readinessAssessmentWeeks: readinessWeeks,
    fullAssessmentWeeks: assessmentWeeks,
    authorizationDecisionWeeks: decisionWeeks,
    totalWeeks,
    phases,
    keyDependencies,
    riskFactors,
  };
}

function buildTimelinePhases(
  input: FedRampInput,
  readinessWeeks: number,
  assessmentWeeks: number,
  decisionWeeks: number,
  baselineRec: BaselineRecommendation
): TimelinePhase[] {
  const phases: TimelinePhase[] = [];

  phases.push({
    phaseNumber: 1,
    name: "Preparation and Remediation",
    description: "Address identified control gaps, develop SSP documentation, complete POA&M items, and prepare for 3PAO readiness assessment.",
    durationWeeks: Math.ceil(readinessWeeks * 0.6),
    activities: [
      "Complete SSP development per FedRAMP template",
      "Implement critical and high-severity POA&M items",
      "Deploy and configure required security tools",
      "Develop policies, procedures, and evidence artifacts",
      "Conduct internal control assessments",
      "Perform vulnerability scans and remediate findings",
    ],
    deliverables: [
      "System Security Plan (SSP)",
      "Security Assessment Plan (SAP) draft",
      "Policy and procedure documents",
      "Network and data flow diagrams",
      "Hardware/software inventory",
      "Initial vulnerability scan results",
    ],
    dependencies: [
      "Budget approval for tooling and personnel",
      "Management commitment and resource allocation",
      "Vendor contracts for security tools",
    ],
  });

  phases.push({
    phaseNumber: 2,
    name: "Readiness Assessment",
    description: "Engage 3PAO for readiness assessment to identify remaining gaps before full assessment. Remediate any findings.",
    durationWeeks: Math.ceil(readinessWeeks * 0.4),
    activities: [
      "Engage FedRAMP-recognized 3PAO",
      "Complete readiness assessment (RAR)",
      "Remediate readiness findings",
      "Finalize SSP and all appendices",
      "Prepare for full security assessment",
      "Submit FedRAMP initiation request (if JAB path)",
    ],
    deliverables: [
      "Readiness Assessment Report (RAR)",
      "Remediation evidence for RAR findings",
      "Finalized SSP with all appendices",
      "FedRAMP initiation package",
    ],
    dependencies: [
      "3PAO engagement and scheduling",
      "Phase 1 remediation completion",
      "Sponsoring agency identification (if Agency path)",
    ],
  });

  phases.push({
    phaseNumber: 3,
    name: "Full Security Assessment",
    description: "3PAO conducts comprehensive security assessment testing all controls in the baseline. CSP remediates findings during assessment.",
    durationWeeks: assessmentWeeks,
    activities: [
      "3PAO conducts documentation review",
      "3PAO performs control testing (interviews, observation, examination, testing)",
      "Penetration testing by 3PAO",
      "Vulnerability scanning validation",
      "CSP remediates findings in real-time where possible",
      "3PAO produces Security Assessment Report (SAR)",
    ],
    deliverables: [
      "Security Assessment Report (SAR)",
      "Security Assessment Plan (SAP) - final",
      "Penetration test report",
      "Vulnerability scan reports (passing)",
      "Updated POA&M",
    ],
    dependencies: [
      "3PAO scheduling and resource availability",
      "CSP environment stability during assessment",
      "All critical systems operational",
    ],
  });

  phases.push({
    phaseNumber: 4,
    name: "Authorization Decision",
    description: `${input.existingAuthorizations.length > 0 ? "Leverage existing authorizations for expedited review. " : ""}Submit complete authorization package for ATO decision.`,
    durationWeeks: decisionWeeks,
    activities: [
      "Compile complete authorization package",
      "Submit to authorizing official (AO)",
      "AO review of SAR, SSP, and POA&M",
      "Address any AO questions or requests",
      "Receive authorization decision (ATO/DATO)",
      "Upload package to FedRAMP Marketplace (if approved)",
    ],
    deliverables: [
      `Authorization decision letter (${baselineRec.baseline} ATO)`,
      "Final authorization package in FedRAMP repository",
      "FedRAMP Marketplace listing",
      "Continuous monitoring kickoff plan",
    ],
    dependencies: [
      "AO availability and review timeline",
      "Clean SAR with acceptable residual risk",
      "All critical/high POA&M items addressed or risk-accepted",
    ],
  });

  phases.push({
    phaseNumber: 5,
    name: "Continuous Monitoring (Ongoing)",
    description: "Transition to continuous monitoring phase with monthly reporting, ongoing scanning, and annual reassessment.",
    durationWeeks: 0,
    activities: [
      "Monthly vulnerability scanning and remediation",
      "Monthly POA&M status reporting",
      "Annual security assessment (1/3 controls per year)",
      "Significant change management",
      "Incident response and reporting",
      "Annual penetration testing",
    ],
    deliverables: [
      "Monthly ConMon reports to FedRAMP PMO",
      "Monthly vulnerability scan results",
      "Annual assessment reports",
      "Updated SSP (at least annually)",
      "Significant change requests (as needed)",
    ],
    dependencies: [
      "Sustained operational security team",
      "Continuous monitoring tooling maintenance",
      "Budget for annual assessments",
    ],
  });

  return phases;
}

function identifyKeyDependencies(input: FedRampInput, poamItems: PoamItem[]): string[] {
  const dependencies: string[] = [];

  dependencies.push("Executive sponsorship and budget commitment for FedRAMP authorization effort");
  dependencies.push("Engagement of FedRAMP-recognized 3PAO for assessment");

  if (input.existingAuthorizations.length === 0) {
    dependencies.push("Identification of sponsoring agency (Agency ATO path) or JAB prioritization decision");
  }

  const vendorDeps = poamItems.filter((p) => p.vendorDependency);
  if (vendorDeps.length > 0) {
    dependencies.push(`Resolution of ${vendorDeps.length} vendor-dependent POA&M items requiring third-party coordination`);
  }

  const criticalItems = poamItems.filter((p) => p.severity === "Critical");
  if (criticalItems.length > 0) {
    dependencies.push(`Remediation of ${criticalItems.length} critical-severity findings before 3PAO assessment`);
  }

  dependencies.push("Stable production environment during assessment period");
  dependencies.push("Dedicated security/compliance team availability throughout authorization process");

  return dependencies;
}

function identifyTimelineRiskFactors(baselineRec: BaselineRecommendation, poamItems: PoamItem[]): string[] {
  const risks: string[] = [];

  if (baselineRec.compliancePercentage < 50) {
    risks.push("Low current compliance percentage may result in extended remediation timeline");
  }

  const criticalCount = poamItems.filter((p) => p.severity === "Critical").length;
  if (criticalCount > 3) {
    risks.push(`${criticalCount} critical findings may delay 3PAO engagement if not resolved`);
  }

  if (baselineRec.baseline === "High") {
    risks.push("FedRAMP High baseline requires more extensive assessment — limited 3PAO capacity available");
  }

  const vendorDeps = poamItems.filter((p) => p.vendorDependency).length;
  if (vendorDeps > 5) {
    risks.push(`${vendorDeps} vendor-dependent items introduce external scheduling dependencies`);
  }

  risks.push("3PAO scheduling constraints (typical 4-8 week lead time for engagement)");
  risks.push("Authorizing Official review timeline not fully within CSP control");
  risks.push("Scope changes during assessment may require additional testing cycles");

  return risks;
}

// ─── Risk Summary ────────────────────────────────────────────────────────────

function buildRiskSummary(
  familyStatuses: ControlFamilyStatus[],
  poamItems: PoamItem[]
): RiskSummary {
  const criticalFindings = poamItems.filter((p) => p.severity === "Critical").length;
  const highFindings = poamItems.filter((p) => p.severity === "High").length;
  const moderateFindings = poamItems.filter((p) => p.severity === "Moderate").length;
  const lowFindings = poamItems.filter((p) => p.severity === "Low" || p.severity === "Very Low").length;
  const totalFindings = poamItems.length;

  let overallRiskLevel: "Critical" | "High" | "Moderate" | "Low";
  if (criticalFindings > 0) {
    overallRiskLevel = "Critical";
  } else if (highFindings > 5) {
    overallRiskLevel = "High";
  } else if (highFindings > 0 || moderateFindings > 10) {
    overallRiskLevel = "Moderate";
  } else {
    overallRiskLevel = "Low";
  }

  const topRiskAreas = identifyTopRiskAreas(familyStatuses, poamItems);
  const mitigationPriorities = buildMitigationPriorities(topRiskAreas, poamItems);
  const residualRiskStatement = buildResidualRiskStatement(overallRiskLevel, totalFindings, criticalFindings);

  return {
    overallRiskLevel,
    totalFindings,
    criticalFindings,
    highFindings,
    moderateFindings,
    lowFindings,
    topRiskAreas,
    mitigationPriorities,
    residualRiskStatement,
  };
}

function identifyTopRiskAreas(
  familyStatuses: ControlFamilyStatus[],
  poamItems: PoamItem[]
): RiskArea[] {
  const riskAreas: RiskArea[] = [];

  const sortedFamilies = [...familyStatuses]
    .filter((f) => f.status !== "fully-compliant")
    .sort((a, b) => a.compliancePercentage - b.compliancePercentage);

  for (const family of sortedFamilies.slice(0, 5)) {
    const familyPoams = poamItems.filter((p) => p.familyId === family.familyId);
    const hasCritical = familyPoams.some((p) => p.severity === "Critical");
    const hasHigh = familyPoams.some((p) => p.severity === "High");

    let riskLevel: "Critical" | "High" | "Moderate" | "Low";
    if (hasCritical) riskLevel = "Critical";
    else if (hasHigh || family.compliancePercentage < 30) riskLevel = "High";
    else if (family.compliancePercentage < 60) riskLevel = "Moderate";
    else riskLevel = "Low";

    riskAreas.push({
      area: `${family.familyId} — ${family.familyName}`,
      riskLevel,
      description: `${family.familyName} is ${family.compliancePercentage}% compliant with ${family.notImplemented} controls not implemented. ${family.criticalGaps.length} critical gaps identified.`,
      affectedControls: familyPoams.map((p) => p.controlId),
      recommendedMitigation: family.recommendations[0] ?? `Address ${family.familyId} control gaps per FedRAMP baseline requirements.`,
    });
  }

  return riskAreas;
}

function buildMitigationPriorities(riskAreas: RiskArea[], poamItems: PoamItem[]): string[] {
  const priorities: string[] = [];

  const criticalPoams = poamItems.filter((p) => p.severity === "Critical");
  if (criticalPoams.length > 0) {
    priorities.push(`Immediately remediate ${criticalPoams.length} critical-severity control gaps to reduce authorization risk`);
  }

  const criticalAreas = riskAreas.filter((r) => r.riskLevel === "Critical");
  for (const area of criticalAreas) {
    priorities.push(`Address critical deficiencies in ${area.area}`);
  }

  const highPoams = poamItems.filter((p) => p.severity === "High");
  if (highPoams.length > 0) {
    priorities.push(`Remediate ${highPoams.length} high-severity findings within 60 days`);
  }

  priorities.push("Establish continuous monitoring capabilities (vulnerability scanning, log monitoring, configuration management)");
  priorities.push("Complete SSP documentation with all required appendices and artifacts");
  priorities.push("Engage 3PAO for readiness assessment once critical/high items are resolved");

  return priorities;
}

function buildResidualRiskStatement(
  overallRisk: "Critical" | "High" | "Moderate" | "Low",
  totalFindings: number,
  criticalFindings: number
): string {
  if (overallRisk === "Critical") {
    return `The system presents CRITICAL residual risk with ${criticalFindings} critical findings and ${totalFindings} total control gaps. The system is NOT ready for 3PAO assessment. Critical deficiencies must be remediated before pursuing FedRAMP authorization. Authorization at this time would not be recommended by any AO.`;
  }
  if (overallRisk === "High") {
    return `The system presents HIGH residual risk with ${totalFindings} total control gaps. Significant remediation effort is required before the system would be considered authorization-ready. Recommend focused remediation sprint followed by readiness assessment to gauge progress.`;
  }
  if (overallRisk === "Moderate") {
    return `The system presents MODERATE residual risk with ${totalFindings} total control gaps. The system shows progress toward authorization readiness but requires continued remediation. With focused effort, the system could be assessment-ready within the estimated timeline.`;
  }
  return `The system presents LOW residual risk with ${totalFindings} total control gaps, all at low/moderate severity. The system is substantially ready for FedRAMP assessment. Remaining items are manageable and can be tracked as POA&M items during authorization.`;
}

// ─── Report Formatting ───────────────────────────────────────────────────────

export function formatFedRampReport(assessment: FedRampAssessment): string {
  const lines: string[] = [];

  lines.push("# FedRAMP Authorization Readiness Assessment Report");
  lines.push(`## ${assessment.systemName}`);
  lines.push(`### Cloud Service Provider: ${assessment.cspName}`);
  lines.push(`**Generated:** ${assessment.generatedDate}`);
  lines.push("");

  // Executive Summary
  lines.push("---");
  lines.push("## 1. Executive Summary");
  lines.push("");
  lines.push(assessment.executiveSummary);
  lines.push("");

  // Baseline Recommendation
  lines.push("---");
  lines.push("## 2. Baseline Recommendation");
  lines.push("");
  lines.push(`**Recommended FedRAMP Baseline:** ${assessment.recommendedBaseline.baseline}`);
  lines.push(`**Total Controls Required:** ${assessment.recommendedBaseline.totalControlsRequired}`);
  lines.push(`**Controls Currently Met:** ${assessment.recommendedBaseline.controlsCurrentlyMet}`);
  lines.push(`**Control Gaps:** ${assessment.recommendedBaseline.controlGapCount}`);
  lines.push(`**Current Compliance:** ${assessment.recommendedBaseline.compliancePercentage}%`);
  lines.push("");
  lines.push("### Rationale");
  for (const reason of assessment.recommendedBaseline.rationale) {
    lines.push(`- ${reason}`);
  }
  lines.push("");
  lines.push(`**Data Classification:** ${assessment.recommendedBaseline.dataTypeJustification}`);
  lines.push("");
  if (assessment.recommendedBaseline.alternativeConsiderations.length > 0) {
    lines.push("### Alternative Considerations");
    for (const alt of assessment.recommendedBaseline.alternativeConsiderations) {
      lines.push(`- ${alt}`);
    }
    lines.push("");
  }

  // Control Family Status
  lines.push("---");
  lines.push("## 3. Control Family Assessment");
  lines.push("");
  lines.push("| Family | Name | Total | Implemented | Gaps | Compliance | Status |");
  lines.push("|--------|------|-------|-------------|------|------------|--------|");
  for (const family of assessment.controlFamilyStatuses) {
    const statusLabel = formatFamilyStatusLabel(family.status);
    lines.push(
      `| ${family.familyId} | ${family.familyName} | ${family.totalControls} | ${family.implemented} | ${family.notImplemented} | ${family.compliancePercentage}% | ${statusLabel} |`
    );
  }
  lines.push("");

  // Detailed family assessment
  lines.push("### Control Family Details");
  lines.push("");
  for (const family of assessment.controlFamilyStatuses) {
    if (family.status === "fully-compliant") continue;

    lines.push(`#### ${family.familyId} — ${family.familyName}`);
    lines.push("");
    lines.push(`**Status:** ${formatFamilyStatusLabel(family.status)} (${family.compliancePercentage}%)`);
    lines.push(`**Implemented:** ${family.implemented} | **Partial:** ${family.partiallyImplemented} | **Planned:** ${family.planned} | **Not Implemented:** ${family.notImplemented}`);
    lines.push("");

    if (family.criticalGaps.length > 0) {
      lines.push("**Critical Gaps:**");
      for (const gap of family.criticalGaps) {
        lines.push(`- ${gap}`);
      }
      lines.push("");
    }

    if (family.recommendations.length > 0) {
      lines.push("**Recommendations:**");
      for (const rec of family.recommendations) {
        lines.push(`- ${rec}`);
      }
      lines.push("");
    }
  }

  // System Security Plan
  lines.push("---");
  lines.push("## 4. System Security Plan (SSP) Structure");
  lines.push("");
  lines.push("### 4.1 System Identification");
  lines.push("");
  const sysId = assessment.systemSecurityPlan.systemIdentification;
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| System Name | ${sysId.systemName} |`);
  lines.push(`| Abbreviation | ${sysId.systemAbbreviation} |`);
  lines.push(`| CSP | ${sysId.cspName} |`);
  lines.push(`| Service Model | ${sysId.serviceModel} |`);
  lines.push(`| Deployment Model | ${sysId.deploymentModel} |`);
  lines.push(`| Security Categorization | ${sysId.securityCategorization} |`);
  lines.push("");

  lines.push("**Information Types:**");
  for (const infoType of sysId.informationTypes) {
    lines.push(`- ${infoType}`);
  }
  lines.push("");

  if (sysId.leveragedAuthorizations.length > 0) {
    lines.push("**Leveraged Authorizations:**");
    for (const auth of sysId.leveragedAuthorizations) {
      lines.push(`- ${auth}`);
    }
    lines.push("");
  }

  // Security Objectives
  lines.push("### 4.2 Security Objectives (FIPS 199)");
  lines.push("");
  const objectives = assessment.systemSecurityPlan.securityObjectives;
  lines.push(`| Objective | Impact Level |`);
  lines.push(`|-----------|-------------|`);
  lines.push(`| Confidentiality | ${objectives.confidentiality} |`);
  lines.push(`| Integrity | ${objectives.integrity} |`);
  lines.push(`| Availability | ${objectives.availability} |`);
  lines.push(`| **Overall** | **${objectives.overallCategorization}** |`);
  lines.push("");

  // Authorization Boundary
  lines.push("### 4.3 Authorization Boundary");
  lines.push("");
  lines.push(assessment.systemSecurityPlan.authorizationBoundary.description);
  lines.push("");
  lines.push("**Boundary Components:**");
  lines.push("");
  lines.push("| Component | Type | In Boundary |");
  lines.push("|-----------|------|-------------|");
  for (const comp of assessment.systemSecurityPlan.authorizationBoundary.components) {
    lines.push(`| ${comp.name} | ${comp.type} | ${comp.inBoundary ? "Yes" : "No (Inherited)"} |`);
  }
  lines.push("");

  lines.push("**External Connections:**");
  lines.push("");
  for (const conn of assessment.systemSecurityPlan.authorizationBoundary.externalConnections) {
    lines.push(`- **${conn.name}** (${conn.organization}): ${conn.connectionType} [${conn.direction}]`);
    lines.push(`  - Security: ${conn.securityMeasures.join(", ")}`);
  }
  lines.push("");

  lines.push("**Data Flows:**");
  lines.push("");
  lines.push("| Source | Destination | Data Type | Protocol | Encryption |");
  lines.push("|--------|-------------|-----------|----------|------------|");
  for (const flow of assessment.systemSecurityPlan.authorizationBoundary.dataFlows) {
    lines.push(`| ${flow.source} | ${flow.destination} | ${flow.dataType} | ${flow.protocol} | ${flow.encryptionMethod} |`);
  }
  lines.push("");

  // Continuous Monitoring
  lines.push("### 4.4 Continuous Monitoring Strategy");
  lines.push("");
  const conmon = assessment.systemSecurityPlan.continuousMonitoring;
  lines.push(`**Monitoring Frequency:** ${conmon.monitoringFrequency}`);
  lines.push(`**Vulnerability Scanning:** ${conmon.vulnerabilityScanningCadence}`);
  lines.push(`**Penetration Testing:** ${conmon.penetrationTestingCadence}`);
  lines.push(`**POA&M Review:** ${conmon.poamReviewCadence}`);
  lines.push(`**Annual Assessment:** ${conmon.annualAssessmentScope}`);
  lines.push("");
  lines.push("**Automated Tools:**");
  for (const tool of conmon.automatedTools) {
    lines.push(`- ${tool}`);
  }
  lines.push("");
  lines.push(`**Significant Change Threshold:** ${conmon.significantChangeThreshold}`);
  lines.push("");

  // POA&M
  lines.push("---");
  lines.push("## 5. Plan of Action and Milestones (POA&M)");
  lines.push("");
  lines.push(`**Total POA&M Items:** ${assessment.poamItems.length}`);
  lines.push("");

  const criticalPoams = assessment.poamItems.filter((p) => p.severity === "Critical");
  const highPoams = assessment.poamItems.filter((p) => p.severity === "High");
  const moderatePoams = assessment.poamItems.filter((p) => p.severity === "Moderate");
  const lowPoams = assessment.poamItems.filter((p) => p.severity === "Low" || p.severity === "Very Low");

  lines.push("| Severity | Count |");
  lines.push("|----------|-------|");
  lines.push(`| Critical | ${criticalPoams.length} |`);
  lines.push(`| High | ${highPoams.length} |`);
  lines.push(`| Moderate | ${moderatePoams.length} |`);
  lines.push(`| Low/Very Low | ${lowPoams.length} |`);
  lines.push("");

  if (criticalPoams.length > 0) {
    lines.push("### Critical POA&M Items");
    lines.push("");
    for (const poam of criticalPoams) {
      lines.push(formatPoamItem(poam));
    }
  }

  if (highPoams.length > 0) {
    lines.push("### High POA&M Items");
    lines.push("");
    for (const poam of highPoams) {
      lines.push(formatPoamItem(poam));
    }
  }

  if (moderatePoams.length > 0) {
    lines.push("### Moderate POA&M Items");
    lines.push("");
    for (const poam of moderatePoams) {
      lines.push(formatPoamItem(poam));
    }
  }

  if (lowPoams.length > 0) {
    lines.push("### Low/Very Low POA&M Items");
    lines.push("");
    for (const poam of lowPoams) {
      lines.push(formatPoamItemCompact(poam));
    }
  }

  // Timeline
  lines.push("---");
  lines.push("## 6. Estimated Authorization Timeline");
  lines.push("");
  lines.push(`**Total Estimated Duration:** ${assessment.estimatedTimeline.totalWeeks} weeks`);
  lines.push("");
  lines.push("| Phase | Duration |");
  lines.push("|-------|----------|");
  lines.push(`| Preparation & Remediation | ${assessment.estimatedTimeline.readinessAssessmentWeeks} weeks |`);
  lines.push(`| Full Security Assessment | ${assessment.estimatedTimeline.fullAssessmentWeeks} weeks |`);
  lines.push(`| Authorization Decision | ${assessment.estimatedTimeline.authorizationDecisionWeeks} weeks |`);
  lines.push("");

  for (const phase of assessment.estimatedTimeline.phases) {
    lines.push(`### Phase ${phase.phaseNumber}: ${phase.name}${phase.durationWeeks > 0 ? ` (${phase.durationWeeks} weeks)` : ""}`);
    lines.push("");
    lines.push(phase.description);
    lines.push("");
    lines.push("**Activities:**");
    for (const activity of phase.activities) {
      lines.push(`- ${activity}`);
    }
    lines.push("");
    lines.push("**Deliverables:**");
    for (const deliverable of phase.deliverables) {
      lines.push(`- [ ] ${deliverable}`);
    }
    lines.push("");
    if (phase.dependencies.length > 0) {
      lines.push("**Dependencies:**");
      for (const dep of phase.dependencies) {
        lines.push(`- ${dep}`);
      }
      lines.push("");
    }
  }

  lines.push("### Key Dependencies");
  lines.push("");
  for (const dep of assessment.estimatedTimeline.keyDependencies) {
    lines.push(`- ${dep}`);
  }
  lines.push("");

  lines.push("### Timeline Risk Factors");
  lines.push("");
  for (const risk of assessment.estimatedTimeline.riskFactors) {
    lines.push(`- ${risk}`);
  }
  lines.push("");

  // Risk Summary
  lines.push("---");
  lines.push("## 7. Risk Summary");
  lines.push("");
  lines.push(`**Overall Risk Level:** ${assessment.riskSummary.overallRiskLevel}`);
  lines.push(`**Total Findings:** ${assessment.riskSummary.totalFindings}`);
  lines.push("");
  lines.push("| Severity | Count |");
  lines.push("|----------|-------|");
  lines.push(`| Critical | ${assessment.riskSummary.criticalFindings} |`);
  lines.push(`| High | ${assessment.riskSummary.highFindings} |`);
  lines.push(`| Moderate | ${assessment.riskSummary.moderateFindings} |`);
  lines.push(`| Low | ${assessment.riskSummary.lowFindings} |`);
  lines.push("");

  lines.push("### Top Risk Areas");
  lines.push("");
  for (const area of assessment.riskSummary.topRiskAreas) {
    lines.push(`#### ${area.area}`);
    lines.push(`**Risk Level:** ${area.riskLevel}`);
    lines.push(`**Description:** ${area.description}`);
    lines.push(`**Affected Controls:** ${area.affectedControls.join(", ")}`);
    lines.push(`**Recommended Mitigation:** ${area.recommendedMitigation}`);
    lines.push("");
  }

  lines.push("### Mitigation Priorities");
  lines.push("");
  for (let i = 0; i < assessment.riskSummary.mitigationPriorities.length; i++) {
    lines.push(`${i + 1}. ${assessment.riskSummary.mitigationPriorities[i]}`);
  }
  lines.push("");

  lines.push("### Residual Risk Statement");
  lines.push("");
  lines.push(assessment.riskSummary.residualRiskStatement);
  lines.push("");

  // Footer
  lines.push("---");
  lines.push("*This report was generated based on FedRAMP requirements, NIST SP 800-53 Rev 5, and FIPS 199/200. FedRAMP is a U.S. government-wide program. This assessment does not constitute a formal FedRAMP authorization — formal authorization requires assessment by a FedRAMP-recognized 3PAO and an authorization decision by a JAB or Agency Authorizing Official (AO).*");

  return lines.join("\n");
}

function formatPoamItem(poam: PoamItem): string {
  const lines: string[] = [];
  lines.push(`#### ${poam.poamId} — ${poam.controlId} (${CONTROL_FAMILIES[poam.familyId].name})`);
  lines.push("");
  lines.push(`**Severity:** ${poam.severity} | **Threat Relevance:** ${poam.relevanceOfThreat} | **Status:** ${poam.status}`);
  lines.push(`**Weakness:** ${poam.weakness}`);
  lines.push(`**Scheduled Completion:** ${poam.scheduledCompletionDate}`);
  lines.push(`**Resources Required:** ${poam.resourcesRequired}`);
  lines.push(`**Estimated Cost:** ${poam.estimatedCost}`);
  if (poam.vendorDependency) {
    lines.push("**Vendor Dependency:** Yes — third-party coordination required");
  }
  lines.push(`**Recommended Action:** ${poam.recommendedAction}`);
  lines.push("");
  lines.push("**Milestones:**");
  for (const milestone of poam.milestones) {
    lines.push(`${milestone.milestoneNumber}. [${milestone.status}] ${milestone.description} (Target: ${milestone.targetDate})`);
  }
  lines.push("");
  return lines.join("\n");
}

function formatPoamItemCompact(poam: PoamItem): string {
  return `- **${poam.poamId}** — ${poam.controlId}: ${poam.weakness.slice(0, 100)}${poam.weakness.length > 100 ? "..." : ""} | Due: ${poam.scheduledCompletionDate}\n`;
}

function formatFamilyStatusLabel(status: FamilyComplianceStatus): string {
  switch (status) {
    case "fully-compliant":
      return "[COMPLIANT]";
    case "substantially-compliant":
      return "[SUBSTANTIAL]";
    case "partially-compliant":
      return "[PARTIAL]";
    case "minimally-compliant":
      return "[MINIMAL]";
    case "non-compliant":
      return "[NON-COMPLIANT]";
  }
}
