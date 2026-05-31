/**
 * PCI DSS v4.0 Self-Assessment Questionnaire + Gap Analysis Engine
 * Generates SAQ type determination, controls assessment, gap analysis, and AoC
 * per PCI Security Standards Council PCI DSS v4.0 (March 2022, mandatory March 2025)
 */

import { generateCompletion } from "../../lib/llm.js";
import {
  PCI_DSS_REQUIREMENTS,
  SAQ_TYPE_DEFINITIONS,
  MERCHANT_LEVELS,
  type SaqType,
  type MerchantLevel,
  type PciRequirement,
  type PciSubRequirement,
} from "../../data/tech/pci-dss-requirements.js";

// ─── Input Interfaces ─────────────────────────────────────────────────────────

export interface PciDssInput {
  companyName: string;
  merchantLevel: MerchantLevel;
  saqType: SaqType | "auto";
  cardProcessingDetails: CardProcessingDetails;
  securityControls: SecurityControlsPerRequirement;
  networkArchitecture: NetworkArchitecture;
  thirdPartyProviders: ThirdPartyServiceProvider[];
  previousAssessment: PreviousAssessment | null;
}

export interface CardProcessingDetails {
  annualTransactionVolume: number;
  channels: PaymentChannel[];
  storageMethod: CardDataStorageMethod;
  cardBrands: CardBrand[];
  processorName: string;
  encryptionInTransit: boolean;
  tokenizationUsed: boolean;
  pointToPointEncryption: boolean;
}

export type PaymentChannel =
  | "e-commerce"
  | "mail-order"
  | "telephone-order"
  | "in-person-chip"
  | "in-person-swipe"
  | "in-person-contactless"
  | "mobile-pos"
  | "virtual-terminal";

export type CardDataStorageMethod =
  | "none"
  | "tokenized-only"
  | "encrypted-pan"
  | "truncated-pan"
  | "full-pan-encrypted"
  | "hashed-pan"
  | "paper-only";

export type CardBrand = "Visa" | "Mastercard" | "American Express" | "Discover" | "JCB" | "UnionPay";

export interface SecurityControlsPerRequirement {
  requirement1: NetworkSecurityControls;
  requirement2: SecureConfigurationControls;
  requirement3: StoredDataProtectionControls;
  requirement4: TransmissionEncryptionControls;
  requirement5: MalwareProtectionControls;
  requirement6: SecureDevelopmentControls;
  requirement7: AccessRestrictionControls;
  requirement8: AuthenticationControls;
  requirement9: PhysicalAccessControls;
  requirement10: LoggingMonitoringControls;
  requirement11: SecurityTestingControls;
  requirement12: PolicyControls;
}

export interface NetworkSecurityControls {
  firewallDeployed: boolean;
  firewallType: string;
  networkSegmentation: boolean;
  dmzImplemented: boolean;
  wirelessSecured: boolean;
  rulesetReviewFrequency: string;
  personalFirewallsOnRemoteDevices: boolean;
}

export interface SecureConfigurationControls {
  defaultsChanged: boolean;
  hardeningStandardsDefined: boolean;
  unnecessaryServicesDisabled: boolean;
  adminAccessEncrypted: boolean;
  configurationStandardDocumented: boolean;
  wirelessDefaultsChanged: boolean;
}

export interface StoredDataProtectionControls {
  dataRetentionPolicyDefined: boolean;
  panMaskedInDisplay: boolean;
  panEncryptedAtRest: boolean;
  encryptionAlgorithm: string;
  keyManagementProcess: boolean;
  sadNotStored: boolean;
  dataDiscoveryPerformed: boolean;
}

export interface TransmissionEncryptionControls {
  tlsVersion: string;
  certificateManagement: boolean;
  insecureProtocolsDisabled: boolean;
  endToEndEncryption: boolean;
  wirelessEncryption: string;
}

export interface MalwareProtectionControls {
  antiMalwareDeployed: boolean;
  antiMalwareCoverage: string;
  realTimeScanningEnabled: boolean;
  signatureUpdatesAutomatic: boolean;
  antiPhishingDeployed: boolean;
  userCannotDisable: boolean;
}

export interface SecureDevelopmentControls {
  sdlcDefined: boolean;
  codeReviewProcess: boolean;
  developerTraining: boolean;
  vulnerabilityManagement: boolean;
  patchManagementProcess: boolean;
  patchSlaInDays: number;
  wafDeployed: boolean;
  changeControlProcess: boolean;
}

export interface AccessRestrictionControls {
  rbacImplemented: boolean;
  needToKnowEnforced: boolean;
  defaultDenyAll: boolean;
  accessReviewFrequency: string;
  privilegedAccessManaged: boolean;
}

export interface AuthenticationControls {
  uniqueIdsAssigned: boolean;
  mfaForCdeAccess: boolean;
  mfaForRemoteAccess: boolean;
  mfaForAdminAccess: boolean;
  passwordComplexityEnforced: boolean;
  passwordMinLength: number;
  accountLockoutEnabled: boolean;
  sessionTimeoutMinutes: number;
  inactiveAccountsDisabled: boolean;
}

export interface PhysicalAccessControls {
  facilityAccessControlled: boolean;
  badgeSystemInPlace: boolean;
  visitorManagement: boolean;
  cameraMonitoring: boolean;
  mediaHandlingProcedures: boolean;
  poiDeviceInventory: boolean;
  poiInspectionSchedule: string;
}

export interface LoggingMonitoringControls {
  auditLoggingEnabled: boolean;
  logCoverage: string;
  logRetentionMonths: number;
  logReviewFrequency: string;
  siemDeployed: boolean;
  siemTool: string;
  timeSyncConfigured: boolean;
  fileIntegrityMonitoring: boolean;
  securityControlFailureAlerts: boolean;
}

export interface SecurityTestingControls {
  internalVulnScanFrequency: string;
  externalAsvScanFrequency: string;
  asvProvider: string;
  penetrationTestFrequency: string;
  penetrationTestProvider: string;
  wirelessScanningPerformed: boolean;
  idsIpsDeployed: boolean;
  changeDetectionOnPaymentPages: boolean;
  segmentationTestingPerformed: boolean;
}

export interface PolicyControls {
  securityPolicyExists: boolean;
  policyReviewFrequency: string;
  securityAwarenessProgram: boolean;
  incidentResponsePlan: boolean;
  incidentResponseTested: boolean;
  riskAssessmentPerformed: boolean;
  riskAssessmentFrequency: string;
  thirdPartyManagementProgram: boolean;
  backgroundChecksPerformed: boolean;
  acceptableUsePolicies: boolean;
}

export interface NetworkArchitecture {
  segmentationType: "flat" | "vlan" | "physical" | "micro-segmentation" | "cloud-vpc";
  cdeIsolated: boolean;
  networkDiagramCurrent: boolean;
  dataFlowDiagramCurrent: boolean;
  firewallVendor: string;
  ipsDeployed: boolean;
  wafVendor: string;
  cloudProvider: string | null;
  hybridEnvironment: boolean;
}

export interface ThirdPartyServiceProvider {
  name: string;
  service: string;
  pciDssCompliant: boolean;
  lastAssessmentDate: string;
  aocOnFile: boolean;
  sharedRequirements: string[];
}

export interface PreviousAssessment {
  assessmentDate: string;
  assessmentType: "SAQ" | "ROC" | "ISA";
  overallResult: "Pass" | "Fail";
  openFindings: number;
  qsaFirm: string | null;
}

// ─── Output Interfaces ────────────────────────────────────────────────────────

export interface PciDssAssessmentOutput {
  companyName: string;
  generatedDate: string;
  saqDetermination: SaqDetermination;
  requirementAssessments: RequirementAssessment[];
  overallComplianceStatus: OverallComplianceStatus;
  gapAnalysis: GapAnalysisReport;
  remediationRoadmap: RemediationRoadmap;
  attestationOfCompliance: AttestationOfCompliance;
  executiveSummary: string;
}

export interface SaqDetermination {
  recommendedType: SaqType;
  justification: string[];
  alternativeTypes: SaqType[];
  eligibilityNotes: string[];
}

export interface RequirementAssessment {
  requirementId: string;
  requirementTitle: string;
  status: ComplianceStatus;
  subRequirementAssessments: SubRequirementAssessment[];
  evidence: string[];
  notes: string;
}

export interface SubRequirementAssessment {
  subRequirementId: string;
  title: string;
  status: ComplianceStatus;
  findings: string;
  evidence: string[];
  testingProceduresPerformed: string[];
}

export type ComplianceStatus = "compliant" | "non-compliant" | "not-applicable" | "partially-compliant";

export interface OverallComplianceStatus {
  status: "compliant" | "non-compliant" | "partially-compliant";
  compliantRequirements: number;
  nonCompliantRequirements: number;
  notApplicableRequirements: number;
  partiallyCompliantRequirements: number;
  totalRequirements: number;
  percentageCompliant: number;
}

export interface GapAnalysisReport {
  totalGaps: number;
  criticalGaps: GapItem[];
  highGaps: GapItem[];
  mediumGaps: GapItem[];
  lowGaps: GapItem[];
}

export interface GapItem {
  id: string;
  requirementId: string;
  requirementTitle: string;
  severity: GapSeverity;
  description: string;
  currentState: string;
  requiredState: string;
  remediationSteps: string[];
  estimatedEffort: string;
  estimatedTimelineDays: number;
  businessImpact: string;
}

export type GapSeverity = "critical" | "high" | "medium" | "low";

export interface RemediationRoadmap {
  phases: RemediationPhase[];
  totalEstimatedDays: number;
  priorityOrder: string[];
  quickWins: string[];
}

export interface RemediationPhase {
  phaseNumber: number;
  name: string;
  description: string;
  timelineDays: number;
  gapIds: string[];
  milestones: string[];
  dependencies: string[];
}

export interface AttestationOfCompliance {
  merchantName: string;
  merchantLevel: MerchantLevel;
  saqType: SaqType;
  assessmentDate: string;
  complianceStatus: "compliant" | "non-compliant";
  signatureBlock: SignatureBlock;
  sections: AocSection[];
}

export interface SignatureBlock {
  merchantExecutiveName: string;
  merchantExecutiveTitle: string;
  assessorName: string;
  assessorCompany: string;
  attestationDate: string;
}

export interface AocSection {
  sectionId: string;
  title: string;
  content: string;
}

// ─── Main Generator Function ──────────────────────────────────────────────────

export async function generatePciDssAssessment(input: PciDssInput): Promise<PciDssAssessmentOutput> {
  const saqDetermination = determineSaqType(input);
  const requirementAssessments = assessAllRequirements(input, saqDetermination.recommendedType);
  const overallStatus = calculateOverallStatus(requirementAssessments);
  const gapAnalysis = performGapAnalysis(input, requirementAssessments);
  const roadmap = buildRemediationRoadmap(gapAnalysis);
  const aoc = buildAttestationOfCompliance(input, overallStatus, saqDetermination.recommendedType);

  const systemPrompt = `You are a PCI DSS Qualified Security Assessor (QSA) providing an executive summary of a PCI DSS v4.0 compliance assessment. Be precise, reference specific requirements, and provide actionable recommendations.`;

  const userPrompt = `Provide a 3-4 paragraph executive summary for:
Company: ${input.companyName}
Merchant Level: ${input.merchantLevel}
SAQ Type: ${saqDetermination.recommendedType}
Annual Transaction Volume: ${input.cardProcessingDetails.annualTransactionVolume.toLocaleString()}
Payment Channels: ${input.cardProcessingDetails.channels.join(", ")}
Overall Compliance: ${overallStatus.percentageCompliant}% (${overallStatus.compliantRequirements}/${overallStatus.totalRequirements} requirements compliant)
Critical Gaps: ${gapAnalysis.criticalGaps.length}
High Gaps: ${gapAnalysis.highGaps.length}
Medium Gaps: ${gapAnalysis.mediumGaps.length}
Low Gaps: ${gapAnalysis.lowGaps.length}
Third-Party Providers: ${input.thirdPartyProviders.length} (${input.thirdPartyProviders.filter((p) => p.pciDssCompliant).length} PCI DSS compliant)
Previous Assessment: ${input.previousAssessment ? `${input.previousAssessment.overallResult} on ${input.previousAssessment.assessmentDate}` : "None on record"}

Address: overall compliance posture, most critical gaps requiring immediate remediation, areas of strength, and timeline estimate for achieving full compliance.`;

  const executiveSummary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 2048,
  });

  return {
    companyName: input.companyName,
    generatedDate: new Date().toISOString().split("T")[0] ?? "",
    saqDetermination,
    requirementAssessments,
    overallComplianceStatus: overallStatus,
    gapAnalysis,
    remediationRoadmap: roadmap,
    attestationOfCompliance: aoc,
    executiveSummary,
  };
}

// ─── SAQ Type Determination ───────────────────────────────────────────────────

function determineSaqType(input: PciDssInput): SaqDetermination {
  if (input.saqType !== "auto") {
    const selectedDef = SAQ_TYPE_DEFINITIONS.find((d) => d.type === input.saqType);
    return {
      recommendedType: input.saqType,
      justification: [`SAQ type ${input.saqType} was explicitly specified by the merchant.`],
      alternativeTypes: [],
      eligibilityNotes: selectedDef ? selectedDef.eligibilityCriteria : [],
    };
  }

  const { channels, storageMethod, pointToPointEncryption } = input.cardProcessingDetails;
  const justification: string[] = [];
  const alternativeTypes: SaqType[] = [];
  const eligibilityNotes: string[] = [];

  // P2PE check
  if (pointToPointEncryption && !channels.includes("e-commerce") && storageMethod === "none") {
    justification.push("Merchant uses a validated PCI-listed P2PE solution for all card-present transactions.");
    justification.push("No electronic cardholder data storage outside P2PE hardware terminals.");
    eligibilityNotes.push("Verify P2PE solution appears on PCI SSC's Validated P2PE Solutions list.");
    eligibilityNotes.push("Confirm P2PE Instruction Manual (PIM) is followed.");
    alternativeTypes.push("D");
    return { recommendedType: "P2PE", justification, alternativeTypes, eligibilityNotes };
  }

  // E-commerce only channels
  const isEcommerceOnly = channels.length === 1 && channels[0] === "e-commerce";
  const hasEcommerce = channels.includes("e-commerce");

  // SAQ A: Fully outsourced e-commerce/MOTO, no electronic storage
  if (
    (isEcommerceOnly || channels.every((c) => ["e-commerce", "mail-order", "telephone-order"].includes(c))) &&
    storageMethod === "none" &&
    input.thirdPartyProviders.some((p) => p.pciDssCompliant)
  ) {
    justification.push("All cardholder data functions are entirely outsourced to PCI DSS validated third-party service providers.");
    justification.push("No electronic storage, processing, or transmission of cardholder data on merchant systems.");
    eligibilityNotes.push("Confirm all service providers maintain current PCI DSS compliance.");
    eligibilityNotes.push("Verify no electronic cardholder data touches merchant infrastructure.");
    alternativeTypes.push("A-EP", "D");
    return { recommendedType: "A", justification, alternativeTypes, eligibilityNotes };
  }

  // SAQ A-EP: E-commerce with partial outsource (redirect/iFrame)
  if (isEcommerceOnly && storageMethod === "none") {
    justification.push("E-commerce only channel with payment processing outsourced to third-party processor.");
    justification.push("Merchant website controls redirect/iFrame to payment processor but does not receive cardholder data directly.");
    eligibilityNotes.push("All payment page elements must originate from PCI DSS compliant service providers.");
    eligibilityNotes.push("Verify website does not directly handle or transmit cardholder data.");
    alternativeTypes.push("A", "D");
    return { recommendedType: "A-EP", justification, alternativeTypes, eligibilityNotes };
  }

  // Card-present only checks
  const cardPresentChannels: PaymentChannel[] = ["in-person-chip", "in-person-swipe", "in-person-contactless", "mobile-pos"];
  const isCardPresentOnly = channels.every((c) => cardPresentChannels.includes(c));

  // SAQ B: Imprint or standalone dial-out only
  if (isCardPresentOnly && storageMethod === "paper-only") {
    justification.push("Merchant uses only imprint machines or standalone dial-out terminals.");
    justification.push("No electronic cardholder data storage; paper records only.");
    eligibilityNotes.push("Confirm terminals are not connected to the internet.");
    eligibilityNotes.push("Standalone dial-out terminals must use analog phone line only.");
    alternativeTypes.push("B-IP", "D");
    return { recommendedType: "B", justification, alternativeTypes, eligibilityNotes };
  }

  // SAQ B-IP: Standalone IP PTS POI terminals
  if (isCardPresentOnly && storageMethod === "none") {
    justification.push("Merchant uses standalone PTS-approved POI devices connected via IP.");
    justification.push("POI devices are not connected to other merchant systems.");
    eligibilityNotes.push("Confirm POI devices are PTS-approved (listed on PCI SSC website).");
    eligibilityNotes.push("POI devices must not be connected to other merchant systems.");
    alternativeTypes.push("C", "D");
    return { recommendedType: "B-IP", justification, alternativeTypes, eligibilityNotes };
  }

  // SAQ C-VT: Virtual terminal
  if (channels.includes("virtual-terminal") && !hasEcommerce && storageMethod === "none") {
    justification.push("Merchant uses web-based virtual terminal provided by PCI DSS validated third-party.");
    justification.push("Transactions entered manually via keyboard, one at a time.");
    eligibilityNotes.push("Virtual terminal must be accessed on dedicated, isolated computing device.");
    eligibilityNotes.push("No batch processing or automated transaction submission.");
    alternativeTypes.push("C", "D");
    return { recommendedType: "C-VT", justification, alternativeTypes, eligibilityNotes };
  }

  // SAQ C: Payment application connected to internet, segmented
  if (!hasEcommerce && input.networkArchitecture.cdeIsolated && storageMethod === "none") {
    justification.push("Payment application system is connected to the internet but segmented from other merchant systems.");
    justification.push("No electronic cardholder data storage outside the payment application system.");
    eligibilityNotes.push("Payment application must be on a segmented network.");
    eligibilityNotes.push("Confirm no other merchant systems store, process, or transmit cardholder data.");
    alternativeTypes.push("D");
    return { recommendedType: "C", justification, alternativeTypes, eligibilityNotes };
  }

  // Default: SAQ D
  justification.push("Merchant environment does not qualify for a reduced SAQ type.");
  if (storageMethod !== "none" && storageMethod !== "paper-only") {
    justification.push(`Cardholder data is stored electronically (method: ${formatStorageMethod(storageMethod)}).`);
  }
  if (hasEcommerce && !isEcommerceOnly) {
    justification.push("Merchant processes through multiple channels including e-commerce and card-present.");
  }
  if (!input.networkArchitecture.cdeIsolated) {
    justification.push("Cardholder data environment is not fully isolated/segmented from other systems.");
  }
  eligibilityNotes.push("SAQ D requires assessment against all applicable PCI DSS requirements.");
  eligibilityNotes.push("Consider engaging a QSA for Level 1 merchants or complex environments.");

  return { recommendedType: "D", justification, alternativeTypes: [], eligibilityNotes };
}

// ─── Requirement Assessment ───────────────────────────────────────────────────

function assessAllRequirements(input: PciDssInput, saqType: SaqType): RequirementAssessment[] {
  return PCI_DSS_REQUIREMENTS.map((requirement) => assessRequirement(requirement, input, saqType));
}

function assessRequirement(
  requirement: PciRequirement,
  input: PciDssInput,
  saqType: SaqType
): RequirementAssessment {
  const subAssessments = requirement.subRequirements.map((sub) =>
    assessSubRequirement(sub, input, saqType, requirement.id)
  );

  const applicableSubs = subAssessments.filter((s) => s.status !== "not-applicable");
  const compliantSubs = applicableSubs.filter((s) => s.status === "compliant");

  let status: ComplianceStatus;
  if (applicableSubs.length === 0) {
    status = "not-applicable";
  } else if (compliantSubs.length === applicableSubs.length) {
    status = "compliant";
  } else if (compliantSubs.length === 0) {
    status = "non-compliant";
  } else {
    status = "partially-compliant";
  }

  const evidence = collectEvidenceForRequirement(requirement.id, input);
  const notes = generateRequirementNotes(requirement.id, input, status);

  return {
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    status,
    subRequirementAssessments: subAssessments,
    evidence,
    notes,
  };
}

function assessSubRequirement(
  sub: PciSubRequirement,
  input: PciDssInput,
  saqType: SaqType,
  parentReqId: string
): SubRequirementAssessment {
  const isApplicable = isSubRequirementApplicable(sub, saqType);

  if (!isApplicable) {
    return {
      subRequirementId: sub.id,
      title: sub.title,
      status: "not-applicable",
      findings: `Not applicable for SAQ type ${saqType}.`,
      evidence: [],
      testingProceduresPerformed: [],
    };
  }

  const { status, findings, evidence } = evaluateControlStatus(sub.id, parentReqId, input);

  return {
    subRequirementId: sub.id,
    title: sub.title,
    status,
    findings,
    evidence,
    testingProceduresPerformed: sub.testingProcedures,
  };
}

function isSubRequirementApplicable(sub: PciSubRequirement, saqType: SaqType): boolean {
  const applicabilityMap: Record<SaqType, keyof typeof sub.applicability> = {
    "A": "saqA",
    "A-EP": "saqAEP",
    "B": "saqB",
    "B-IP": "saqBIP",
    "C": "saqC",
    "C-VT": "saqCVT",
    "D": "saqD",
    "P2PE": "saqP2PE",
  };

  const key = applicabilityMap[saqType];
  return sub.applicability[key];
}

function evaluateControlStatus(
  subReqId: string,
  parentReqId: string,
  input: PciDssInput
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  const controls = input.securityControls;

  switch (parentReqId) {
    case "1":
      return evaluateRequirement1(subReqId, controls.requirement1, input);
    case "2":
      return evaluateRequirement2(subReqId, controls.requirement2);
    case "3":
      return evaluateRequirement3(subReqId, controls.requirement3, input);
    case "4":
      return evaluateRequirement4(subReqId, controls.requirement4);
    case "5":
      return evaluateRequirement5(subReqId, controls.requirement5);
    case "6":
      return evaluateRequirement6(subReqId, controls.requirement6);
    case "7":
      return evaluateRequirement7(subReqId, controls.requirement7);
    case "8":
      return evaluateRequirement8(subReqId, controls.requirement8);
    case "9":
      return evaluateRequirement9(subReqId, controls.requirement9);
    case "10":
      return evaluateRequirement10(subReqId, controls.requirement10);
    case "11":
      return evaluateRequirement11(subReqId, controls.requirement11);
    case "12":
      return evaluateRequirement12(subReqId, controls.requirement12, input);
    default:
      return { status: "non-compliant", findings: "Unable to evaluate requirement.", evidence: [] };
  }
}

function evaluateRequirement1(
  subReqId: string,
  controls: NetworkSecurityControls,
  input: PciDssInput
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "1.1":
      return {
        status: controls.firewallDeployed ? "compliant" : "non-compliant",
        findings: controls.firewallDeployed
          ? "Network security control policies and procedures are defined. Firewall type documented and rule review schedule established."
          : "No documented policies and procedures for network security controls identified.",
        evidence: controls.firewallDeployed
          ? [`Firewall deployed: ${controls.firewallType}`, `Ruleset review frequency: ${controls.rulesetReviewFrequency}`]
          : [],
      };
    case "1.2":
      return {
        status: controls.firewallDeployed && controls.networkSegmentation ? "compliant" : controls.firewallDeployed ? "partially-compliant" : "non-compliant",
        findings: controls.firewallDeployed && controls.networkSegmentation
          ? "NSC rulesets configured to restrict traffic to/from CDE. Network segmentation implemented to isolate cardholder data environment."
          : controls.firewallDeployed
            ? "Firewall deployed but network segmentation may not be fully implemented or documented."
            : "No NSC rulesets or network segmentation detected.",
        evidence: [
          controls.firewallDeployed ? `Firewall: ${controls.firewallType}` : "No firewall",
          controls.networkSegmentation ? "Network segmentation: Implemented" : "Network segmentation: Not implemented",
          `Architecture: ${input.networkArchitecture.segmentationType}`,
        ],
      };
    case "1.3":
      return {
        status: controls.networkSegmentation && input.networkArchitecture.cdeIsolated ? "compliant" : "non-compliant",
        findings: controls.networkSegmentation && input.networkArchitecture.cdeIsolated
          ? "Network access to and from the CDE is restricted to only necessary and authorized traffic."
          : "CDE is not adequately isolated; network access restrictions may be insufficient.",
        evidence: [
          `CDE isolated: ${input.networkArchitecture.cdeIsolated}`,
          `Network diagram current: ${input.networkArchitecture.networkDiagramCurrent}`,
        ],
      };
    case "1.4":
      return {
        status: controls.firewallDeployed && controls.dmzImplemented ? "compliant" : controls.firewallDeployed ? "partially-compliant" : "non-compliant",
        findings: controls.dmzImplemented
          ? "Connections between trusted and untrusted networks controlled via DMZ and NSC. Anti-spoofing measures reviewed."
          : "DMZ not implemented between trusted and untrusted networks.",
        evidence: [
          `DMZ implemented: ${controls.dmzImplemented}`,
          `Firewall vendor: ${input.networkArchitecture.firewallVendor}`,
        ],
      };
    case "1.5":
      return {
        status: controls.personalFirewallsOnRemoteDevices ? "compliant" : "non-compliant",
        findings: controls.personalFirewallsOnRemoteDevices
          ? "Personal firewalls or equivalent controls deployed on devices connecting to both untrusted networks and the CDE."
          : "No personal firewall or equivalent controls on devices connecting to both untrusted networks and CDE.",
        evidence: [
          `Personal firewalls: ${controls.personalFirewallsOnRemoteDevices ? "Deployed" : "Not deployed"}`,
        ],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement2(
  subReqId: string,
  controls: SecureConfigurationControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "2.1":
      return {
        status: controls.configurationStandardDocumented ? "compliant" : "non-compliant",
        findings: controls.configurationStandardDocumented
          ? "Secure configuration policies and operational procedures are documented, assigned, and understood."
          : "No documented secure configuration standards or procedures identified.",
        evidence: [
          `Configuration standards documented: ${controls.configurationStandardDocumented}`,
          `Hardening standards defined: ${controls.hardeningStandardsDefined}`,
        ],
      };
    case "2.2":
      return {
        status: controls.defaultsChanged && controls.unnecessaryServicesDisabled && controls.adminAccessEncrypted
          ? "compliant"
          : controls.defaultsChanged
            ? "partially-compliant"
            : "non-compliant",
        findings: controls.defaultsChanged && controls.unnecessaryServicesDisabled
          ? "Vendor defaults changed, unnecessary services disabled, and administrative access encrypted. System components configured securely."
          : "One or more secure configuration requirements are not fully met (defaults, service hardening, or admin encryption).",
        evidence: [
          `Vendor defaults changed: ${controls.defaultsChanged}`,
          `Unnecessary services disabled: ${controls.unnecessaryServicesDisabled}`,
          `Admin access encrypted: ${controls.adminAccessEncrypted}`,
        ],
      };
    case "2.3":
      return {
        status: controls.wirelessDefaultsChanged ? "compliant" : "non-compliant",
        findings: controls.wirelessDefaultsChanged
          ? "Wireless vendor defaults changed and wireless environments configured securely with strong encryption."
          : "Wireless defaults have not been confirmed as changed. Potential exposure from default wireless configurations.",
        evidence: [`Wireless defaults changed: ${controls.wirelessDefaultsChanged}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement3(
  subReqId: string,
  controls: StoredDataProtectionControls,
  input: PciDssInput
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  const storageMethod = input.cardProcessingDetails.storageMethod;
  const noElectronicStorage = storageMethod === "none" || storageMethod === "paper-only";

  switch (subReqId) {
    case "3.1":
      return {
        status: controls.dataRetentionPolicyDefined || noElectronicStorage ? "compliant" : "non-compliant",
        findings: controls.dataRetentionPolicyDefined
          ? "Policies and procedures for protecting stored account data are defined and documented."
          : noElectronicStorage
            ? "No electronic cardholder data storage; policies for paper handling documented."
            : "No documented data retention or protection policies for stored account data.",
        evidence: [`Data retention policy defined: ${controls.dataRetentionPolicyDefined}`, `Storage method: ${storageMethod}`],
      };
    case "3.2":
      return {
        status: controls.dataRetentionPolicyDefined && (controls.dataDiscoveryPerformed || noElectronicStorage) ? "compliant" : "non-compliant",
        findings: noElectronicStorage
          ? "No electronic storage of account data. Retention minimized by design."
          : controls.dataRetentionPolicyDefined && controls.dataDiscoveryPerformed
            ? "Data retention limited to business/legal requirements. Data discovery confirms no unauthorized storage."
            : "Data retention may exceed requirements or data discovery has not been performed to confirm minimum storage.",
        evidence: [
          `Data discovery performed: ${controls.dataDiscoveryPerformed}`,
          `Retention policy: ${controls.dataRetentionPolicyDefined}`,
        ],
      };
    case "3.3":
      return {
        status: controls.sadNotStored ? "compliant" : "non-compliant",
        findings: controls.sadNotStored
          ? "Sensitive authentication data (full track, CVV2/CVC2, PIN/PIN block) is not stored after authorization."
          : "Cannot confirm sensitive authentication data is purged post-authorization. This is a critical compliance failure.",
        evidence: [`SAD not stored post-authorization: ${controls.sadNotStored}`],
      };
    case "3.4":
      return {
        status: controls.panMaskedInDisplay || noElectronicStorage ? "compliant" : "non-compliant",
        findings: controls.panMaskedInDisplay
          ? "PAN is masked when displayed (max first 6 / last 4 visible). Full PAN access restricted to documented business need."
          : noElectronicStorage
            ? "No electronic PAN display; paper records controlled per policy."
            : "PAN masking not confirmed. Full PAN may be visible to unauthorized personnel.",
        evidence: [`PAN masked in display: ${controls.panMaskedInDisplay}`],
      };
    case "3.5":
      return {
        status: noElectronicStorage ? "compliant" : controls.panEncryptedAtRest ? "compliant" : "non-compliant",
        findings: noElectronicStorage
          ? "No electronic PAN storage; requirement met by absence of stored data."
          : controls.panEncryptedAtRest
            ? `PAN rendered unreadable wherever stored using ${controls.encryptionAlgorithm}.`
            : "PAN is not adequately protected at rest. Strong cryptography must be applied.",
        evidence: noElectronicStorage
          ? ["No electronic PAN storage"]
          : [`Encryption at rest: ${controls.panEncryptedAtRest}`, `Algorithm: ${controls.encryptionAlgorithm}`],
      };
    case "3.6":
      return {
        status: noElectronicStorage ? "compliant" : controls.keyManagementProcess ? "compliant" : "non-compliant",
        findings: noElectronicStorage
          ? "No cryptographic keys needed (no electronic storage)."
          : controls.keyManagementProcess
            ? "Cryptographic key management processes defined covering generation, distribution, storage, retirement, and destruction."
            : "No formal key management process documented. Cryptographic keys may not be adequately secured.",
        evidence: [`Key management process: ${controls.keyManagementProcess}`],
      };
    case "3.7":
      return {
        status: noElectronicStorage ? "compliant" : controls.keyManagementProcess ? "compliant" : "non-compliant",
        findings: noElectronicStorage
          ? "Not applicable — no cryptographic keys in use for stored data."
          : controls.keyManagementProcess
            ? "Complete key lifecycle management implemented per industry standards (generation, distribution, storage, rotation, retirement, destruction)."
            : "Key lifecycle management procedures are incomplete or not documented.",
        evidence: [`Key management process: ${controls.keyManagementProcess}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement4(
  subReqId: string,
  controls: TransmissionEncryptionControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "4.1":
      return {
        status: controls.insecureProtocolsDisabled ? "compliant" : "non-compliant",
        findings: controls.insecureProtocolsDisabled
          ? "Policies and procedures for protecting cardholder data during transmission are defined and documented."
          : "Insecure protocols may still be enabled. Transmission encryption policies need documentation.",
        evidence: [`Insecure protocols disabled: ${controls.insecureProtocolsDisabled}`, `TLS version: ${controls.tlsVersion}`],
      };
    case "4.2":
      return {
        status: controls.tlsVersion >= "1.2" && controls.certificateManagement && controls.insecureProtocolsDisabled
          ? "compliant"
          : controls.tlsVersion >= "1.2"
            ? "partially-compliant"
            : "non-compliant",
        findings: controls.tlsVersion >= "1.2" && controls.certificateManagement
          ? `PAN protected with TLS ${controls.tlsVersion} during transmission. Certificate management in place. Insecure fallback disabled.`
          : controls.tlsVersion >= "1.2"
            ? `TLS ${controls.tlsVersion} configured but certificate management or fallback controls may be incomplete.`
            : `TLS version ${controls.tlsVersion} does not meet minimum requirement of TLS 1.2.`,
        evidence: [
          `TLS version: ${controls.tlsVersion}`,
          `Certificate management: ${controls.certificateManagement}`,
          `End-to-end encryption: ${controls.endToEndEncryption}`,
        ],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement5(
  subReqId: string,
  controls: MalwareProtectionControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "5.1":
      return {
        status: controls.antiMalwareDeployed ? "compliant" : "non-compliant",
        findings: controls.antiMalwareDeployed
          ? "Malware protection policies and procedures are defined and the anti-malware program is documented."
          : "No anti-malware program documented or deployed.",
        evidence: [`Anti-malware deployed: ${controls.antiMalwareDeployed}`, `Coverage: ${controls.antiMalwareCoverage}`],
      };
    case "5.2":
      return {
        status: controls.antiMalwareDeployed && controls.realTimeScanningEnabled ? "compliant" : controls.antiMalwareDeployed ? "partially-compliant" : "non-compliant",
        findings: controls.realTimeScanningEnabled
          ? "Anti-malware deployed on all applicable system components with periodic and real-time scanning enabled."
          : controls.antiMalwareDeployed
            ? "Anti-malware deployed but real-time scanning not confirmed on all components."
            : "Anti-malware solution not deployed.",
        evidence: [
          `Real-time scanning: ${controls.realTimeScanningEnabled}`,
          `Coverage: ${controls.antiMalwareCoverage}`,
        ],
      };
    case "5.3":
      return {
        status: controls.signatureUpdatesAutomatic && controls.userCannotDisable ? "compliant" : "partially-compliant",
        findings: controls.signatureUpdatesAutomatic && controls.userCannotDisable
          ? "Anti-malware kept current with automatic updates, generates audit logs, and cannot be disabled by users."
          : "Anti-malware maintenance controls need improvement (signature updates or user-disable prevention).",
        evidence: [
          `Automatic updates: ${controls.signatureUpdatesAutomatic}`,
          `User cannot disable: ${controls.userCannotDisable}`,
        ],
      };
    case "5.4":
      return {
        status: controls.antiPhishingDeployed ? "compliant" : "non-compliant",
        findings: controls.antiPhishingDeployed
          ? "Anti-phishing mechanisms deployed to protect personnel against email and web-based phishing attacks."
          : "No anti-phishing technical controls identified. Personnel remain exposed to phishing attacks.",
        evidence: [`Anti-phishing deployed: ${controls.antiPhishingDeployed}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement6(
  subReqId: string,
  controls: SecureDevelopmentControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "6.1":
      return {
        status: controls.sdlcDefined ? "compliant" : "non-compliant",
        findings: controls.sdlcDefined
          ? "Secure development lifecycle policies and procedures are defined, documented, and assigned."
          : "No formal secure development lifecycle defined.",
        evidence: [`SDLC defined: ${controls.sdlcDefined}`],
      };
    case "6.2":
      return {
        status: controls.sdlcDefined && controls.codeReviewProcess && controls.developerTraining ? "compliant" : "partially-compliant",
        findings: controls.codeReviewProcess && controls.developerTraining
          ? "Bespoke/custom software developed securely with code reviews, developer training in secure coding, and vulnerability prevention techniques."
          : "Secure development practices need enhancement (code review or developer training gaps).",
        evidence: [
          `Code review process: ${controls.codeReviewProcess}`,
          `Developer training: ${controls.developerTraining}`,
          `SDLC defined: ${controls.sdlcDefined}`,
        ],
      };
    case "6.3":
      return {
        status: controls.vulnerabilityManagement && controls.patchManagementProcess ? "compliant" : "non-compliant",
        findings: controls.vulnerabilityManagement && controls.patchManagementProcess
          ? `Vulnerability management and patch management processes in place. Patch SLA: ${controls.patchSlaInDays} days for critical/high.`
          : "Vulnerability identification and/or patch management processes not fully implemented.",
        evidence: [
          `Vulnerability management: ${controls.vulnerabilityManagement}`,
          `Patch management: ${controls.patchManagementProcess}`,
          `Patch SLA: ${controls.patchSlaInDays} days`,
        ],
      };
    case "6.4":
      return {
        status: controls.wafDeployed ? "compliant" : "non-compliant",
        findings: controls.wafDeployed
          ? "Public-facing web applications protected by WAF or equivalent automated technical solution. Script management implemented for payment pages."
          : "No WAF or automated protection for public-facing web applications. Payment page scripts may not be managed.",
        evidence: [`WAF deployed: ${controls.wafDeployed}`],
      };
    case "6.5":
      return {
        status: controls.changeControlProcess ? "compliant" : "non-compliant",
        findings: controls.changeControlProcess
          ? "Change management process includes documentation, approval, testing, and back-out procedures for all production changes."
          : "No formal change control process for production systems.",
        evidence: [`Change control process: ${controls.changeControlProcess}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement7(
  subReqId: string,
  controls: AccessRestrictionControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "7.1":
      return {
        status: controls.rbacImplemented ? "compliant" : "non-compliant",
        findings: controls.rbacImplemented
          ? "Access restriction policies and procedures are defined with role-based access control as the model."
          : "No documented access control policies or RBAC model.",
        evidence: [`RBAC implemented: ${controls.rbacImplemented}`],
      };
    case "7.2":
      return {
        status: controls.rbacImplemented && controls.needToKnowEnforced && controls.privilegedAccessManaged
          ? "compliant"
          : controls.rbacImplemented
            ? "partially-compliant"
            : "non-compliant",
        findings: controls.needToKnowEnforced && controls.privilegedAccessManaged
          ? `Access defined and assigned based on need-to-know. Access reviews performed ${controls.accessReviewFrequency}. Privileged access managed.`
          : "Access control model not fully enforcing need-to-know and/or privileged access not adequately managed.",
        evidence: [
          `Need-to-know enforced: ${controls.needToKnowEnforced}`,
          `Privileged access managed: ${controls.privilegedAccessManaged}`,
          `Review frequency: ${controls.accessReviewFrequency}`,
        ],
      };
    case "7.3":
      return {
        status: controls.defaultDenyAll ? "compliant" : "non-compliant",
        findings: controls.defaultDenyAll
          ? "Access control system enforces authorization per user need-to-know with default-deny-all configuration."
          : "Access control system not confirmed as default-deny-all. Potential for excessive access.",
        evidence: [`Default deny all: ${controls.defaultDenyAll}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement8(
  subReqId: string,
  controls: AuthenticationControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "8.1":
      return {
        status: controls.uniqueIdsAssigned ? "compliant" : "non-compliant",
        findings: controls.uniqueIdsAssigned
          ? "Identification and authentication policies and procedures are defined and documented."
          : "No formal identification and authentication policies documented.",
        evidence: [`Unique IDs assigned: ${controls.uniqueIdsAssigned}`],
      };
    case "8.2":
      return {
        status: controls.uniqueIdsAssigned && controls.inactiveAccountsDisabled ? "compliant" : "partially-compliant",
        findings: controls.uniqueIdsAssigned && controls.inactiveAccountsDisabled
          ? `User identification strictly managed. Unique IDs assigned, inactive accounts disabled. Session timeout: ${controls.sessionTimeoutMinutes} minutes.`
          : "User lifecycle management needs improvement (unique IDs or inactive account management).",
        evidence: [
          `Unique IDs: ${controls.uniqueIdsAssigned}`,
          `Inactive accounts disabled: ${controls.inactiveAccountsDisabled}`,
          `Session timeout: ${controls.sessionTimeoutMinutes} minutes`,
        ],
      };
    case "8.3":
      return {
        status: controls.passwordComplexityEnforced && controls.accountLockoutEnabled && controls.passwordMinLength >= 12
          ? "compliant"
          : controls.passwordComplexityEnforced
            ? "partially-compliant"
            : "non-compliant",
        findings: controls.passwordMinLength >= 12 && controls.accountLockoutEnabled
          ? `Strong authentication enforced: ${controls.passwordMinLength}-character minimum, complexity required, account lockout enabled.`
          : `Password requirements need enhancement. Minimum length: ${controls.passwordMinLength} (requires 12). Lockout: ${controls.accountLockoutEnabled}.`,
        evidence: [
          `Password min length: ${controls.passwordMinLength}`,
          `Complexity enforced: ${controls.passwordComplexityEnforced}`,
          `Account lockout: ${controls.accountLockoutEnabled}`,
        ],
      };
    case "8.4":
      return {
        status: controls.mfaForCdeAccess && controls.mfaForRemoteAccess ? "compliant" : "non-compliant",
        findings: controls.mfaForCdeAccess && controls.mfaForRemoteAccess
          ? "MFA implemented for all access into the CDE and all remote network access."
          : "MFA not fully implemented for CDE access and/or remote access. Critical gap.",
        evidence: [
          `MFA for CDE: ${controls.mfaForCdeAccess}`,
          `MFA for remote: ${controls.mfaForRemoteAccess}`,
          `MFA for admin: ${controls.mfaForAdminAccess}`,
        ],
      };
    case "8.5":
      return {
        status: controls.mfaForCdeAccess && controls.mfaForAdminAccess ? "compliant" : "non-compliant",
        findings: controls.mfaForCdeAccess && controls.mfaForAdminAccess
          ? "MFA systems configured to prevent misuse (replay attacks mitigated, enforced without exceptions)."
          : "MFA system configuration needs review to ensure protection against bypass or replay.",
        evidence: [`MFA for CDE: ${controls.mfaForCdeAccess}`, `MFA for admin: ${controls.mfaForAdminAccess}`],
      };
    case "8.6":
      return {
        status: controls.uniqueIdsAssigned ? "partially-compliant" : "non-compliant",
        findings: "Application and system account management should be verified — interactive login disabled for service accounts, passwords rotated or certificate-based.",
        evidence: [`Unique IDs assigned (baseline): ${controls.uniqueIdsAssigned}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement9(
  subReqId: string,
  controls: PhysicalAccessControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "9.1":
      return {
        status: controls.facilityAccessControlled ? "compliant" : "non-compliant",
        findings: controls.facilityAccessControlled
          ? "Physical access policies and procedures are defined and documented for restricting access to cardholder data."
          : "No documented physical access restriction policies.",
        evidence: [`Facility access controlled: ${controls.facilityAccessControlled}`],
      };
    case "9.2":
      return {
        status: controls.badgeSystemInPlace && controls.visitorManagement ? "compliant" : "partially-compliant",
        findings: controls.badgeSystemInPlace && controls.visitorManagement
          ? "Physical access controls manage facility entry. Badge system and visitor management procedures in place."
          : "Physical access controls partially implemented (badge system or visitor management may need enhancement).",
        evidence: [
          `Badge system: ${controls.badgeSystemInPlace}`,
          `Visitor management: ${controls.visitorManagement}`,
          `Camera monitoring: ${controls.cameraMonitoring}`,
        ],
      };
    case "9.3":
      return {
        status: controls.facilityAccessControlled && controls.visitorManagement ? "compliant" : "partially-compliant",
        findings: controls.facilityAccessControlled
          ? "Physical access for personnel and visitors is authorized and managed based on job function."
          : "Physical access management procedures need improvement.",
        evidence: [`Facility controlled: ${controls.facilityAccessControlled}`, `Visitor management: ${controls.visitorManagement}`],
      };
    case "9.4":
      return {
        status: controls.mediaHandlingProcedures ? "compliant" : "non-compliant",
        findings: controls.mediaHandlingProcedures
          ? "Media containing cardholder data is physically secured, distribution controlled, and destruction procedures defined."
          : "No documented media handling or destruction procedures for cardholder data.",
        evidence: [`Media handling procedures: ${controls.mediaHandlingProcedures}`],
      };
    case "9.5":
      return {
        status: controls.poiDeviceInventory ? "compliant" : "non-compliant",
        findings: controls.poiDeviceInventory
          ? `POI device inventory maintained. Inspection schedule: ${controls.poiInspectionSchedule}. Personnel trained on tamper detection.`
          : "No POI device inventory or inspection procedures documented.",
        evidence: [
          `POI inventory: ${controls.poiDeviceInventory}`,
          `Inspection schedule: ${controls.poiInspectionSchedule}`,
        ],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement10(
  subReqId: string,
  controls: LoggingMonitoringControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "10.1":
      return {
        status: controls.auditLoggingEnabled ? "compliant" : "non-compliant",
        findings: controls.auditLoggingEnabled
          ? "Logging and monitoring policies and procedures are defined. Audit logging framework documented and assigned."
          : "No formal logging and monitoring policies documented.",
        evidence: [`Audit logging enabled: ${controls.auditLoggingEnabled}`, `SIEM: ${controls.siemTool}`],
      };
    case "10.2":
      return {
        status: controls.auditLoggingEnabled && controls.logCoverage === "all-cde-components" ? "compliant" : controls.auditLoggingEnabled ? "partially-compliant" : "non-compliant",
        findings: controls.logCoverage === "all-cde-components"
          ? "Audit logs implemented on all system components in/connected to the CDE. All required event types logged."
          : "Audit logging not confirmed on all CDE-connected system components.",
        evidence: [`Log coverage: ${controls.logCoverage}`, `SIEM deployed: ${controls.siemDeployed}`],
      };
    case "10.3":
      return {
        status: controls.fileIntegrityMonitoring ? "compliant" : "non-compliant",
        findings: controls.fileIntegrityMonitoring
          ? "Audit logs protected from destruction and unauthorized modification via file integrity monitoring and access controls."
          : "File integrity monitoring not deployed on audit logs. Logs may be vulnerable to tampering.",
        evidence: [`FIM deployed: ${controls.fileIntegrityMonitoring}`],
      };
    case "10.4":
      return {
        status: controls.siemDeployed && controls.logReviewFrequency === "daily" ? "compliant" : controls.siemDeployed ? "partially-compliant" : "non-compliant",
        findings: controls.logReviewFrequency === "daily" && controls.siemDeployed
          ? `Audit logs reviewed daily via ${controls.siemTool}. Automated mechanisms identify anomalies and suspicious activity.`
          : `Log review frequency (${controls.logReviewFrequency}) may not meet daily requirement, or SIEM automation not fully deployed.`,
        evidence: [`Log review frequency: ${controls.logReviewFrequency}`, `SIEM: ${controls.siemTool}`],
      };
    case "10.5":
      return {
        status: controls.logRetentionMonths >= 12 ? "compliant" : "non-compliant",
        findings: controls.logRetentionMonths >= 12
          ? `Audit log history retained for ${controls.logRetentionMonths} months (minimum 12 required). At least 3 months immediately available.`
          : `Log retention of ${controls.logRetentionMonths} months does not meet the 12-month minimum requirement.`,
        evidence: [`Retention: ${controls.logRetentionMonths} months`],
      };
    case "10.6":
      return {
        status: controls.timeSyncConfigured ? "compliant" : "non-compliant",
        findings: controls.timeSyncConfigured
          ? "Time synchronization configured across all systems using NTP or equivalent from industry-accepted sources."
          : "Time synchronization not confirmed. Log correlation may be unreliable.",
        evidence: [`Time sync: ${controls.timeSyncConfigured}`],
      };
    case "10.7":
      return {
        status: controls.securityControlFailureAlerts ? "compliant" : "non-compliant",
        findings: controls.securityControlFailureAlerts
          ? "Failures of critical security control systems are detected, alerted, and responded to promptly."
          : "No alerting mechanism for failures of critical security controls (firewalls, IDS, FIM, anti-malware, logging).",
        evidence: [`Security control failure alerts: ${controls.securityControlFailureAlerts}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement11(
  subReqId: string,
  controls: SecurityTestingControls
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "11.1":
      return {
        status: controls.internalVulnScanFrequency !== "never" ? "compliant" : "non-compliant",
        findings: controls.internalVulnScanFrequency !== "never"
          ? "Security testing policies and procedures are defined and documented."
          : "No formal security testing program documented.",
        evidence: [`Internal scan frequency: ${controls.internalVulnScanFrequency}`],
      };
    case "11.2":
      return {
        status: controls.wirelessScanningPerformed ? "compliant" : "non-compliant",
        findings: controls.wirelessScanningPerformed
          ? "Wireless access points identified and monitored quarterly. Unauthorized APs addressed."
          : "No wireless scanning process to detect unauthorized access points.",
        evidence: [`Wireless scanning: ${controls.wirelessScanningPerformed}`],
      };
    case "11.3":
      return {
        status: controls.internalVulnScanFrequency === "quarterly" && controls.externalAsvScanFrequency === "quarterly"
          ? "compliant"
          : controls.internalVulnScanFrequency !== "never" || controls.externalAsvScanFrequency !== "never"
            ? "partially-compliant"
            : "non-compliant",
        findings: controls.internalVulnScanFrequency === "quarterly" && controls.externalAsvScanFrequency === "quarterly"
          ? `Internal and external vulnerability scans performed quarterly. ASV: ${controls.asvProvider}.`
          : `Vulnerability scan frequency does not meet quarterly requirement. Internal: ${controls.internalVulnScanFrequency}, External ASV: ${controls.externalAsvScanFrequency}.`,
        evidence: [
          `Internal scans: ${controls.internalVulnScanFrequency}`,
          `External ASV scans: ${controls.externalAsvScanFrequency}`,
          `ASV provider: ${controls.asvProvider}`,
        ],
      };
    case "11.4":
      return {
        status: controls.penetrationTestFrequency === "annually" || controls.penetrationTestFrequency === "semi-annually"
          ? "compliant"
          : "non-compliant",
        findings: controls.penetrationTestFrequency === "annually" || controls.penetrationTestFrequency === "semi-annually"
          ? `Penetration testing performed ${controls.penetrationTestFrequency} by ${controls.penetrationTestProvider}. Covers network and application layers.`
          : "Penetration testing not performed at least annually as required.",
        evidence: [
          `Pen test frequency: ${controls.penetrationTestFrequency}`,
          `Provider: ${controls.penetrationTestProvider}`,
          `Segmentation testing: ${controls.segmentationTestingPerformed}`,
        ],
      };
    case "11.5":
      return {
        status: controls.idsIpsDeployed ? "compliant" : "non-compliant",
        findings: controls.idsIpsDeployed
          ? "IDS/IPS deployed to detect network intrusions. Change detection mechanisms monitor critical files."
          : "No IDS/IPS or intrusion detection mechanisms deployed.",
        evidence: [`IDS/IPS: ${controls.idsIpsDeployed}`],
      };
    case "11.6":
      return {
        status: controls.changeDetectionOnPaymentPages ? "compliant" : "non-compliant",
        findings: controls.changeDetectionOnPaymentPages
          ? "Change and tamper detection mechanism deployed on payment pages to alert on unauthorized modifications."
          : "No change/tamper detection on payment pages. Vulnerable to Magecart-style script injection attacks.",
        evidence: [`Payment page monitoring: ${controls.changeDetectionOnPaymentPages}`],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

function evaluateRequirement12(
  subReqId: string,
  controls: PolicyControls,
  input: PciDssInput
): { status: ComplianceStatus; findings: string; evidence: string[] } {
  switch (subReqId) {
    case "12.1":
      return {
        status: controls.securityPolicyExists ? "compliant" : "non-compliant",
        findings: controls.securityPolicyExists
          ? `Information security policy established, reviewed ${controls.policyReviewFrequency}, and disseminated. Security responsibilities assigned.`
          : "No comprehensive information security policy established.",
        evidence: [`Policy exists: ${controls.securityPolicyExists}`, `Review frequency: ${controls.policyReviewFrequency}`],
      };
    case "12.2":
      return {
        status: controls.acceptableUsePolicies ? "compliant" : "non-compliant",
        findings: controls.acceptableUsePolicies
          ? "Acceptable use policies defined for critical technologies (remote access, wireless, removable media, devices, email, internet)."
          : "No acceptable use policies for end-user technologies documented.",
        evidence: [`Acceptable use policies: ${controls.acceptableUsePolicies}`],
      };
    case "12.3":
      return {
        status: controls.riskAssessmentPerformed ? "compliant" : "non-compliant",
        findings: controls.riskAssessmentPerformed
          ? `Formal risk assessment performed ${controls.riskAssessmentFrequency}. Identifies threats, vulnerabilities, and risk to the CDE.`
          : "No formal risk assessment performed or documented for the cardholder data environment.",
        evidence: [`Risk assessment: ${controls.riskAssessmentPerformed}`, `Frequency: ${controls.riskAssessmentFrequency}`],
      };
    case "12.4":
      return {
        status: "not-applicable",
        findings: "Requirement 12.4 is an additional requirement for service providers only.",
        evidence: [],
      };
    case "12.5":
      return {
        status: controls.securityPolicyExists ? "compliant" : "non-compliant",
        findings: controls.securityPolicyExists
          ? "PCI DSS scope documented and validated. In-scope system components identified with descriptions. Scope reviewed annually."
          : "PCI DSS scope documentation not confirmed.",
        evidence: [`Security policy (scope section): ${controls.securityPolicyExists}`],
      };
    case "12.6":
      return {
        status: controls.securityAwarenessProgram ? "compliant" : "non-compliant",
        findings: controls.securityAwarenessProgram
          ? "Security awareness program educates all personnel upon hire and annually. Includes cardholder data protection awareness."
          : "No formal security awareness program in place.",
        evidence: [`Security awareness program: ${controls.securityAwarenessProgram}`],
      };
    case "12.7":
      return {
        status: controls.backgroundChecksPerformed ? "compliant" : "non-compliant",
        findings: controls.backgroundChecksPerformed
          ? "Background checks performed prior to hire for personnel with access to CDE/cardholder data."
          : "Background screening not performed or not documented for CDE personnel.",
        evidence: [`Background checks: ${controls.backgroundChecksPerformed}`],
      };
    case "12.8":
      return {
        status: controls.thirdPartyManagementProgram && input.thirdPartyProviders.every((p) => p.aocOnFile)
          ? "compliant"
          : controls.thirdPartyManagementProgram
            ? "partially-compliant"
            : "non-compliant",
        findings: controls.thirdPartyManagementProgram
          ? `Third-party service provider management program in place. ${input.thirdPartyProviders.length} providers tracked; ${input.thirdPartyProviders.filter((p) => p.aocOnFile).length} have AoC on file.`
          : "No formal third-party service provider management program.",
        evidence: [
          `TPSP program: ${controls.thirdPartyManagementProgram}`,
          `Providers tracked: ${input.thirdPartyProviders.length}`,
          `AoCs on file: ${input.thirdPartyProviders.filter((p) => p.aocOnFile).length}`,
        ],
      };
    case "12.9":
      return {
        status: "not-applicable",
        findings: "Requirement 12.9 is an additional requirement for third-party service providers only.",
        evidence: [],
      };
    case "12.10":
      return {
        status: controls.incidentResponsePlan && controls.incidentResponseTested ? "compliant" : controls.incidentResponsePlan ? "partially-compliant" : "non-compliant",
        findings: controls.incidentResponsePlan && controls.incidentResponseTested
          ? "Incident response plan implemented, tested at least annually, and covers all required elements per PCI DSS 12.10.1."
          : controls.incidentResponsePlan
            ? "Incident response plan exists but has not been tested within the past 12 months."
            : "No incident response plan documented.",
        evidence: [
          `IR plan: ${controls.incidentResponsePlan}`,
          `IR tested: ${controls.incidentResponseTested}`,
        ],
      };
    default:
      return { status: "non-compliant", findings: "Sub-requirement not evaluated.", evidence: [] };
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function collectEvidenceForRequirement(requirementId: string, input: PciDssInput): string[] {
  const evidence: string[] = [];
  const controls = input.securityControls;

  switch (requirementId) {
    case "1":
      evidence.push(`Firewall type: ${controls.requirement1.firewallType}`);
      evidence.push(`Network segmentation: ${controls.requirement1.networkSegmentation}`);
      evidence.push(`Architecture: ${input.networkArchitecture.segmentationType}`);
      break;
    case "2":
      evidence.push(`Hardening standards: ${controls.requirement2.hardeningStandardsDefined}`);
      evidence.push(`Configuration documented: ${controls.requirement2.configurationStandardDocumented}`);
      break;
    case "3":
      evidence.push(`Storage method: ${input.cardProcessingDetails.storageMethod}`);
      evidence.push(`Encryption: ${controls.requirement3.encryptionAlgorithm}`);
      break;
    case "4":
      evidence.push(`TLS version: ${controls.requirement4.tlsVersion}`);
      evidence.push(`Certificate management: ${controls.requirement4.certificateManagement}`);
      break;
    case "5":
      evidence.push(`Anti-malware coverage: ${controls.requirement5.antiMalwareCoverage}`);
      break;
    case "6":
      evidence.push(`SDLC: ${controls.requirement6.sdlcDefined}`);
      evidence.push(`WAF: ${controls.requirement6.wafDeployed}`);
      break;
    case "7":
      evidence.push(`RBAC: ${controls.requirement7.rbacImplemented}`);
      evidence.push(`Access reviews: ${controls.requirement7.accessReviewFrequency}`);
      break;
    case "8":
      evidence.push(`MFA for CDE: ${controls.requirement8.mfaForCdeAccess}`);
      evidence.push(`Password min length: ${controls.requirement8.passwordMinLength}`);
      break;
    case "9":
      evidence.push(`Badge system: ${controls.requirement9.badgeSystemInPlace}`);
      evidence.push(`POI inventory: ${controls.requirement9.poiDeviceInventory}`);
      break;
    case "10":
      evidence.push(`SIEM: ${controls.requirement10.siemTool}`);
      evidence.push(`Log retention: ${controls.requirement10.logRetentionMonths} months`);
      break;
    case "11":
      evidence.push(`ASV provider: ${controls.requirement11.asvProvider}`);
      evidence.push(`Pen test provider: ${controls.requirement11.penetrationTestProvider}`);
      break;
    case "12":
      evidence.push(`Policy review: ${controls.requirement12.policyReviewFrequency}`);
      evidence.push(`IR plan tested: ${controls.requirement12.incidentResponseTested}`);
      break;
  }

  return evidence;
}

function generateRequirementNotes(requirementId: string, input: PciDssInput, status: ComplianceStatus): string {
  if (status === "compliant") {
    return `Requirement ${requirementId} is fully compliant based on controls assessment.`;
  }
  if (status === "not-applicable") {
    return `Requirement ${requirementId} is not applicable based on SAQ type and merchant environment.`;
  }

  const merchantLevel = MERCHANT_LEVELS.find((m) => m.level === input.merchantLevel);
  const levelNote = merchantLevel
    ? ` For Level ${merchantLevel.level} merchants, ${merchantLevel.validationRequirements[0]?.toLowerCase() ?? "validation is required"}.`
    : "";

  return `Requirement ${requirementId} has gaps that must be addressed to achieve PCI DSS compliance.${levelNote} See gap analysis for specific remediation steps.`;
}

// ─── Overall Status Calculation ───────────────────────────────────────────────

function calculateOverallStatus(assessments: RequirementAssessment[]): OverallComplianceStatus {
  let compliant = 0;
  let nonCompliant = 0;
  let notApplicable = 0;
  let partial = 0;

  for (const assessment of assessments) {
    switch (assessment.status) {
      case "compliant":
        compliant++;
        break;
      case "non-compliant":
        nonCompliant++;
        break;
      case "not-applicable":
        notApplicable++;
        break;
      case "partially-compliant":
        partial++;
        break;
    }
  }

  const applicable = assessments.length - notApplicable;
  const percentage = applicable > 0 ? Math.round((compliant / applicable) * 100) : 100;

  return {
    status: nonCompliant === 0 && partial === 0 ? "compliant" : nonCompliant > 0 ? "non-compliant" : "partially-compliant",
    compliantRequirements: compliant,
    nonCompliantRequirements: nonCompliant,
    notApplicableRequirements: notApplicable,
    partiallyCompliantRequirements: partial,
    totalRequirements: assessments.length,
    percentageCompliant: percentage,
  };
}

// ─── Gap Analysis ─────────────────────────────────────────────────────────────

function performGapAnalysis(input: PciDssInput, assessments: RequirementAssessment[]): GapAnalysisReport {
  const gaps: GapItem[] = [];
  let gapCounter = 1;

  for (const assessment of assessments) {
    if (assessment.status === "compliant" || assessment.status === "not-applicable") {
      continue;
    }

    for (const subAssessment of assessment.subRequirementAssessments) {
      if (subAssessment.status === "compliant" || subAssessment.status === "not-applicable") {
        continue;
      }

      const severity = determineGapSeverity(subAssessment.subRequirementId, assessment.requirementId, input);
      const gap = buildGapItem(
        `GAP-${String(gapCounter).padStart(3, "0")}`,
        assessment,
        subAssessment,
        severity,
        input
      );
      gaps.push(gap);
      gapCounter++;
    }
  }

  return {
    totalGaps: gaps.length,
    criticalGaps: gaps.filter((g) => g.severity === "critical"),
    highGaps: gaps.filter((g) => g.severity === "high"),
    mediumGaps: gaps.filter((g) => g.severity === "medium"),
    lowGaps: gaps.filter((g) => g.severity === "low"),
  };
}

function determineGapSeverity(subReqId: string, parentReqId: string, input: PciDssInput): GapSeverity {
  // Critical: Direct cardholder data exposure, no encryption, SAD storage
  const criticalSubReqs = ["3.3", "3.5", "4.2", "8.4", "8.3"];
  if (criticalSubReqs.includes(subReqId)) return "critical";

  // Critical if storing data without encryption
  if (parentReqId === "3" && input.cardProcessingDetails.storageMethod !== "none") return "critical";

  // High: Core security controls missing
  const highSubReqs = ["1.2", "1.3", "5.2", "6.4", "7.2", "8.3", "10.2", "11.3", "11.4", "12.10"];
  if (highSubReqs.includes(subReqId)) return "high";

  // High: MFA gaps
  if (subReqId.startsWith("8.4") || subReqId.startsWith("8.5")) return "high";

  // Medium: Supporting controls
  const mediumSubReqs = ["1.4", "1.5", "2.2", "5.3", "6.3", "6.5", "9.2", "9.4", "10.3", "10.4", "11.2", "12.3", "12.6"];
  if (mediumSubReqs.includes(subReqId)) return "medium";

  // Low: Documentation and governance gaps
  const lowSubReqs = ["1.1", "2.1", "3.1", "4.1", "5.1", "6.1", "7.1", "8.1", "9.1", "10.1", "11.1", "12.1", "12.2", "12.5"];
  if (lowSubReqs.includes(subReqId)) return "low";

  return "medium";
}

function buildGapItem(
  gapId: string,
  assessment: RequirementAssessment,
  subAssessment: SubRequirementAssessment,
  severity: GapSeverity,
  input: PciDssInput
): GapItem {
  const remediationSteps = getRemediationSteps(subAssessment.subRequirementId, assessment.requirementId, input);
  const effort = estimateEffort(severity, subAssessment.subRequirementId);
  const timeline = estimateTimelineDays(severity, subAssessment.subRequirementId);

  return {
    id: gapId,
    requirementId: subAssessment.subRequirementId,
    requirementTitle: subAssessment.title,
    severity,
    description: subAssessment.findings,
    currentState: subAssessment.status === "partially-compliant" ? "Partially implemented" : "Not implemented",
    requiredState: `Full compliance with PCI DSS v4.0 Requirement ${subAssessment.subRequirementId}`,
    remediationSteps,
    estimatedEffort: effort,
    estimatedTimelineDays: timeline,
    businessImpact: getBusinessImpact(severity, assessment.requirementId),
  };
}

function getRemediationSteps(subReqId: string, _parentReqId: string, _input: PciDssInput): string[] {
  const stepsMap: Record<string, string[]> = {
    "1.1": [
      "Document network security control policies and operational procedures",
      "Assign ownership of NSC management to specific personnel",
      "Establish schedule for ruleset reviews (at least every 6 months)",
    ],
    "1.2": [
      "Implement restrictive NSC rulesets permitting only necessary traffic to/from CDE",
      "Document all allowed services/protocols/ports with business justification",
      "Configure NSCs between all wireless networks and the CDE",
      "Create and maintain accurate network diagrams",
      "Establish 6-month review cycle for NSC rulesets",
    ],
    "1.3": [
      "Implement network segmentation to isolate the CDE from other networks",
      "Configure NSCs to restrict inbound and outbound traffic to CDE to only what is necessary",
      "Validate segmentation effectiveness through penetration testing",
    ],
    "1.4": [
      "Deploy DMZ between public-facing systems and internal networks",
      "Implement anti-spoofing measures on network boundaries",
      "Ensure internal IP addresses and routing information are not disclosed externally",
    ],
    "1.5": [
      "Deploy personal firewall or equivalent on all devices connecting to both untrusted networks and CDE",
      "Configure personal firewalls to deny all inbound traffic by default",
      "Prevent end users from disabling personal firewalls",
    ],
    "2.2": [
      "Change all vendor default passwords and settings before deployment",
      "Disable or remove unnecessary services, protocols, daemons, and functions",
      "Configure system security parameters to prevent misuse",
      "Encrypt all non-console administrative access with strong cryptography",
    ],
    "3.3": [
      "CRITICAL: Immediately verify no sensitive authentication data (full track, CVV, PIN) is stored post-authorization",
      "Scan all data stores for potential SAD retention",
      "Implement automated purge of SAD after authorization response",
      "Configure payment application to prevent SAD storage",
    ],
    "3.5": [
      "Implement strong cryptography (AES-256 or equivalent) for PAN at rest",
      "Deploy hardware security module (HSM) or secure key management",
      "Ensure encryption covers all storage locations including backups and logs",
    ],
    "4.2": [
      "Upgrade to TLS 1.2 or higher on all systems transmitting cardholder data",
      "Disable TLS 1.0, TLS 1.1, and SSL on all systems",
      "Implement certificate management process with monitoring for expiration",
      "Configure systems to reject fallback to insecure protocols",
    ],
    "5.2": [
      "Deploy anti-malware on all system components commonly affected by malware",
      "Enable real-time/active scanning and periodic scheduled scans",
      "Document systems excluded from anti-malware with periodic risk re-evaluation",
    ],
    "6.4": [
      "Deploy Web Application Firewall (WAF) in front of all public-facing web applications",
      "Configure WAF to detect and prevent common web attacks (OWASP Top 10)",
      "Implement script management for all payment page scripts (authorization, integrity, inventory)",
    ],
    "8.3": [
      "Enforce minimum 12-character passwords with numeric and alphabetic characters",
      "Implement account lockout after 10 invalid attempts (minimum 30-minute lockout)",
      "Configure password/passphrase change every 90 days or implement dynamic risk analysis",
      "Implement password history (minimum last 4 passwords)",
    ],
    "8.4": [
      "Implement multi-factor authentication for ALL access into the CDE",
      "Implement MFA for ALL remote network access that could access the CDE",
      "Implement MFA for ALL non-console administrative access",
      "Ensure MFA uses at least two of: something you know, have, or are",
    ],
    "10.2": [
      "Enable audit logging on all system components in and connected to the CDE",
      "Configure logging for: user access to cardholder data, administrative actions, audit trail access, invalid access attempts, authentication events",
      "Deploy centralized log management solution (SIEM)",
    ],
    "11.3": [
      "Engage an Approved Scanning Vendor (ASV) for quarterly external vulnerability scans",
      "Implement quarterly internal vulnerability scanning program",
      "Establish process for rescanning until passing results are achieved",
      "Define vulnerability remediation SLAs by severity level",
    ],
    "11.4": [
      "Engage qualified penetration testing firm for annual testing",
      "Ensure scope covers entire CDE perimeter and critical systems",
      "Include both network-layer and application-layer testing",
      "Test network segmentation controls at least annually (every 6 months for service providers)",
      "Retest after remediation to verify corrections",
    ],
    "12.10": [
      "Develop comprehensive incident response plan covering all PCI DSS 12.10.1 elements",
      "Designate 24/7 on-call personnel for incident response",
      "Test the incident response plan at least annually",
      "Train incident response team at least annually",
      "Integrate with security monitoring system alerts",
    ],
  };

  const steps = stepsMap[subReqId];
  if (steps) return steps;

  // Generic remediation based on parent requirement
  return [
    `Review PCI DSS v4.0 Requirement ${subReqId} testing procedures`,
    `Implement controls to meet Requirement ${subReqId} specifications`,
    `Document evidence of compliance including policies, configurations, and test results`,
    `Conduct validation testing to confirm control effectiveness`,
  ];
}

function estimateEffort(severity: GapSeverity, subReqId: string): string {
  const effortMap: Record<GapSeverity, string> = {
    critical: "High — immediate action required, potentially multiple teams and budget allocation",
    high: "Medium-High — dedicated project, likely 2-4 weeks of focused effort",
    medium: "Medium — 1-2 weeks of implementation and testing",
    low: "Low — documentation and process update, typically < 1 week",
  };

  // Specific overrides for complex implementations
  if (subReqId === "3.5" || subReqId === "3.6") return "High — encryption implementation requires careful planning, testing, and key management infrastructure";
  if (subReqId === "11.4") return "Medium — requires vendor engagement and scheduling (4-6 week lead time typical)";
  if (subReqId === "10.2") return "Medium-High — SIEM deployment and log source integration typically takes 3-6 weeks";

  return effortMap[severity];
}

function estimateTimelineDays(severity: GapSeverity, subReqId: string): number {
  // Specific estimates for known complex implementations
  const specificTimelines: Record<string, number> = {
    "3.5": 60,
    "3.6": 45,
    "4.2": 30,
    "6.4": 30,
    "8.4": 21,
    "10.2": 45,
    "11.3": 14,
    "11.4": 45,
    "11.5": 30,
    "12.10": 21,
  };

  const specificDays = specificTimelines[subReqId];
  if (specificDays !== undefined) return specificDays;

  const severityTimelines: Record<GapSeverity, number> = {
    critical: 14,
    high: 30,
    medium: 21,
    low: 7,
  };

  return severityTimelines[severity];
}

function getBusinessImpact(severity: GapSeverity, _requirementId: string): string {
  if (severity === "critical") {
    return "Immediate risk of cardholder data exposure. Non-compliance may result in fines, increased transaction fees, or loss of card processing privileges.";
  }
  if (severity === "high") {
    return "Significant security gap that increases breach risk. Card brands may require accelerated remediation timeline.";
  }
  if (severity === "medium") {
    return "Control deficiency that should be addressed to maintain defense-in-depth. May be cited in formal assessment.";
  }
  return "Administrative or documentation gap. While lower risk, required for formal compliance validation.";
}

// ─── Remediation Roadmap ──────────────────────────────────────────────────────

function buildRemediationRoadmap(gapAnalysis: GapAnalysisReport): RemediationRoadmap {
  const phases: RemediationPhase[] = [];
  const quickWins: string[] = [];

  // Phase 1: Critical and quick wins (0-14 days)
  const criticalGapIds = gapAnalysis.criticalGaps.map((g) => g.id);
  const lowGapIds = gapAnalysis.lowGaps.map((g) => g.id);

  if (criticalGapIds.length > 0 || lowGapIds.length > 0) {
    phases.push({
      phaseNumber: 1,
      name: "Immediate Remediation",
      description: "Address critical security gaps and quick-win documentation items. Critical gaps present immediate risk to cardholder data and must be resolved with highest priority.",
      timelineDays: 14,
      gapIds: [...criticalGapIds, ...lowGapIds],
      milestones: [
        "All critical data exposure risks eliminated",
        "SAD storage confirmed purged (if applicable)",
        "Emergency encryption deployed for unprotected PAN (if applicable)",
        "Documentation gaps resolved",
      ],
      dependencies: [],
    });
    quickWins.push(...lowGapIds);
  }

  // Phase 2: High priority (15-45 days)
  const highGapIds = gapAnalysis.highGaps.map((g) => g.id);
  if (highGapIds.length > 0) {
    phases.push({
      phaseNumber: 2,
      name: "High-Priority Controls Implementation",
      description: "Deploy core security controls including MFA, vulnerability management, and access controls. These controls form the foundation of CDE protection.",
      timelineDays: 30,
      gapIds: highGapIds,
      milestones: [
        "MFA deployed for all CDE and remote access",
        "Vulnerability scanning program operational (internal + ASV)",
        "WAF deployed for public-facing web applications",
        "Access control model fully enforced",
      ],
      dependencies: ["Phase 1 completion"],
    });
  }

  // Phase 3: Medium priority (46-90 days)
  const mediumGapIds = gapAnalysis.mediumGaps.map((g) => g.id);
  if (mediumGapIds.length > 0) {
    phases.push({
      phaseNumber: 3,
      name: "Supporting Controls and Hardening",
      description: "Implement supporting security controls, enhance monitoring, and harden configurations. These controls provide defense-in-depth and operational maturity.",
      timelineDays: 45,
      gapIds: mediumGapIds,
      milestones: [
        "SIEM fully operational with daily log review",
        "Penetration testing completed",
        "Change management process formalized",
        "Physical security controls validated",
        "Security awareness training delivered to all personnel",
      ],
      dependencies: ["Phase 2 completion"],
    });
  }

  // Phase 4: Validation (91-120 days)
  phases.push({
    phaseNumber: phases.length + 1,
    name: "Validation and Certification",
    description: "Perform comprehensive validation testing, conduct internal audit, engage QSA/ISA if required, and complete formal attestation.",
    timelineDays: 30,
    gapIds: [],
    milestones: [
      "Internal controls validation completed",
      "ASV passing scan achieved",
      "Penetration test results clean (or remediated)",
      "SAQ completed and signed",
      "AoC submitted to acquirer/payment brands",
    ],
    dependencies: ["All previous phases completed"],
  });

  const totalDays = phases.reduce((sum, p) => sum + p.timelineDays, 0);
  const priorityOrder = [
    ...criticalGapIds,
    ...highGapIds,
    ...mediumGapIds,
    ...lowGapIds,
  ];

  return {
    phases,
    totalEstimatedDays: totalDays,
    priorityOrder,
    quickWins,
  };
}

// ─── Attestation of Compliance ────────────────────────────────────────────────

function buildAttestationOfCompliance(
  input: PciDssInput,
  overallStatus: OverallComplianceStatus,
  saqType: SaqType
): AttestationOfCompliance {
  const sections = buildAocSections(input, overallStatus, saqType);

  return {
    merchantName: input.companyName,
    merchantLevel: input.merchantLevel,
    saqType,
    assessmentDate: new Date().toISOString().split("T")[0] ?? "",
    complianceStatus: overallStatus.status === "compliant" ? "compliant" : "non-compliant",
    signatureBlock: {
      merchantExecutiveName: "[Authorized Officer Name]",
      merchantExecutiveTitle: "[Title]",
      assessorName: input.merchantLevel === 1 ? "[QSA Name]" : "[ISA/Self-Assessment]",
      assessorCompany: input.merchantLevel === 1 ? "[QSA Firm]" : input.companyName,
      attestationDate: new Date().toISOString().split("T")[0] ?? "",
    },
    sections,
  };
}

function buildAocSections(
  input: PciDssInput,
  overallStatus: OverallComplianceStatus,
  saqType: SaqType
): AocSection[] {
  const merchantLevelDef = MERCHANT_LEVELS.find((m) => m.level === input.merchantLevel);
  const saqDef = SAQ_TYPE_DEFINITIONS.find((d) => d.type === saqType);

  return [
    {
      sectionId: "1",
      title: "Executive Summary",
      content: `This Attestation of Compliance documents the results of the PCI DSS v4.0 assessment for ${input.companyName}. The assessment was conducted using Self-Assessment Questionnaire type ${saqType} (${saqDef?.name ?? ""}) for a Merchant Level ${input.merchantLevel} entity.`,
    },
    {
      sectionId: "2a",
      title: "Merchant Information",
      content: `Merchant Name: ${input.companyName}\nMerchant Level: ${input.merchantLevel} (${merchantLevelDef?.description ?? ""})\nSAQ Type: ${saqType}\nPayment Channels: ${input.cardProcessingDetails.channels.join(", ")}\nAnnual Transaction Volume: ${input.cardProcessingDetails.annualTransactionVolume.toLocaleString()}\nCard Brands: ${input.cardProcessingDetails.cardBrands.join(", ")}\nPayment Processor: ${input.cardProcessingDetails.processorName}`,
    },
    {
      sectionId: "2b",
      title: "Description of Payment Card Business",
      content: `${input.companyName} processes payment card transactions through the following channels: ${input.cardProcessingDetails.channels.join(", ")}. Cardholder data storage method: ${formatStorageMethod(input.cardProcessingDetails.storageMethod)}. ${input.cardProcessingDetails.tokenizationUsed ? "Tokenization is utilized for stored card references." : ""} ${input.cardProcessingDetails.pointToPointEncryption ? "Point-to-Point Encryption (P2PE) is deployed for card-present transactions." : ""}`,
    },
    {
      sectionId: "2c",
      title: "Third-Party Service Providers",
      content: input.thirdPartyProviders.length > 0
        ? `The following third-party service providers are involved in the storage, processing, or transmission of cardholder data, or could affect the security of the CDE:\n\n${input.thirdPartyProviders.map((p) => `- ${p.name} (${p.service}) — PCI DSS Compliant: ${p.pciDssCompliant ? "Yes" : "No"}, AoC on file: ${p.aocOnFile ? "Yes" : "No"}, Last assessed: ${p.lastAssessmentDate}`).join("\n")}`
        : "No third-party service providers store, process, or transmit cardholder data on behalf of the merchant.",
    },
    {
      sectionId: "3",
      title: "PCI DSS Compliance Status",
      content: `Overall Compliance Status: ${overallStatus.status.toUpperCase()}\n\nCompliant Requirements: ${overallStatus.compliantRequirements} of ${overallStatus.totalRequirements}\nNon-Compliant Requirements: ${overallStatus.nonCompliantRequirements}\nPartially Compliant Requirements: ${overallStatus.partiallyCompliantRequirements}\nNot Applicable: ${overallStatus.notApplicableRequirements}\nCompliance Percentage: ${overallStatus.percentageCompliant}%`,
    },
    {
      sectionId: "4",
      title: "Network Segmentation",
      content: `Network Segmentation: ${input.networkArchitecture.cdeIsolated ? "Yes — CDE is isolated from other networks" : "No — flat network or incomplete segmentation"}\nSegmentation Type: ${input.networkArchitecture.segmentationType}\nNetwork Diagram Current: ${input.networkArchitecture.networkDiagramCurrent ? "Yes" : "No"}\nData Flow Diagram Current: ${input.networkArchitecture.dataFlowDiagramCurrent ? "Yes" : "No"}\n\n${input.networkArchitecture.cdeIsolated ? "The CDE is segmented from all other networks. Segmentation controls have been validated." : "NOTE: Without proper segmentation, the entire network is in scope for PCI DSS assessment."}`,
    },
    {
      sectionId: "5",
      title: "Validation Information",
      content: `Assessment Type: Self-Assessment Questionnaire (SAQ) Type ${saqType}\nAssessment Date: ${new Date().toISOString().split("T")[0]}\nReporting Entity: ${merchantLevelDef?.reportingEntity ?? "Self-assessment"}\n${input.previousAssessment ? `\nPrevious Assessment: ${input.previousAssessment.assessmentType} on ${input.previousAssessment.assessmentDate} — Result: ${input.previousAssessment.overallResult}${input.previousAssessment.qsaFirm ? ` (QSA: ${input.previousAssessment.qsaFirm})` : ""}` : "\nNo previous assessment on record."}`,
    },
    {
      sectionId: "6",
      title: "Attestation and Acknowledgment",
      content: `The undersigned merchant executive and assessor (if applicable) acknowledge:\n\n1. The results of this assessment accurately reflect the security controls and practices of ${input.companyName}.\n2. This assessment was conducted in accordance with PCI DSS v4.0 requirements.\n3. ${overallStatus.status === "compliant" ? `${input.companyName} is fully compliant with all applicable PCI DSS requirements as evaluated in SAQ type ${saqType}.` : `${input.companyName} has identified areas of non-compliance and commits to remediating all gaps per the documented remediation roadmap.`}\n4. ${input.companyName} acknowledges its responsibility to maintain PCI DSS compliance at all times.\n5. ${input.companyName} will notify its acquirer immediately of any change in its compliance status.\n\nMerchant Executive: [Signature]\nName: [Authorized Officer]\nTitle: [Title]\nDate: ${new Date().toISOString().split("T")[0]}\n\n${input.merchantLevel === 1 ? "QSA Signature: [Signature]\nQSA Name: [QSA Name]\nQSA Firm: [QSA Firm]\nDate: [Date]" : ""}`,
    },
  ];
}

// ─── Report Formatting ────────────────────────────────────────────────────────

export function formatPciReport(output: PciDssAssessmentOutput): string {
  const lines: string[] = [];

  lines.push(`# PCI DSS v4.0 Compliance Assessment Report`);
  lines.push(`## ${output.companyName}`);
  lines.push(`**Generated:** ${output.generatedDate}`);
  lines.push("");

  // Executive Summary
  lines.push("---");
  lines.push("## Executive Summary");
  lines.push("");
  lines.push(output.executiveSummary);
  lines.push("");

  // SAQ Determination
  lines.push("---");
  lines.push("## SAQ Type Determination");
  lines.push("");
  lines.push(`**Recommended SAQ Type:** ${output.saqDetermination.recommendedType}`);
  lines.push("");
  lines.push("### Justification");
  for (const reason of output.saqDetermination.justification) {
    lines.push(`- ${reason}`);
  }
  lines.push("");
  if (output.saqDetermination.alternativeTypes.length > 0) {
    lines.push(`**Alternative Types Considered:** ${output.saqDetermination.alternativeTypes.join(", ")}`);
    lines.push("");
  }
  if (output.saqDetermination.eligibilityNotes.length > 0) {
    lines.push("### Eligibility Notes");
    for (const note of output.saqDetermination.eligibilityNotes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  // Overall Compliance Status
  lines.push("---");
  lines.push("## Overall Compliance Status");
  lines.push("");
  const status = output.overallComplianceStatus;
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| **Overall Status** | **${status.status.toUpperCase()}** |`);
  lines.push(`| Compliance Percentage | ${status.percentageCompliant}% |`);
  lines.push(`| Compliant Requirements | ${status.compliantRequirements} |`);
  lines.push(`| Non-Compliant Requirements | ${status.nonCompliantRequirements} |`);
  lines.push(`| Partially Compliant | ${status.partiallyCompliantRequirements} |`);
  lines.push(`| Not Applicable | ${status.notApplicableRequirements} |`);
  lines.push(`| Total Requirements Assessed | ${status.totalRequirements} |`);
  lines.push("");

  // Per-Requirement Assessment
  lines.push("---");
  lines.push("## Requirement-by-Requirement Assessment");
  lines.push("");

  for (const assessment of output.requirementAssessments) {
    const statusIcon = getStatusIndicator(assessment.status);
    lines.push(`### Requirement ${assessment.requirementId}: ${assessment.requirementTitle}`);
    lines.push(`**Status:** ${statusIcon} ${assessment.status.toUpperCase()}`);
    lines.push("");

    if (assessment.subRequirementAssessments.length > 0) {
      lines.push("| Sub-Requirement | Status | Finding |");
      lines.push("|-----------------|--------|---------|");
      for (const sub of assessment.subRequirementAssessments) {
        if (sub.status !== "not-applicable") {
          const subIcon = getStatusIndicator(sub.status);
          const truncatedFinding = sub.findings.length > 80 ? sub.findings.slice(0, 77) + "..." : sub.findings;
          lines.push(`| ${sub.subRequirementId} | ${subIcon} ${sub.status} | ${truncatedFinding} |`);
        }
      }
      lines.push("");
    }

    if (assessment.evidence.length > 0) {
      lines.push("**Evidence:**");
      for (const ev of assessment.evidence) {
        lines.push(`- ${ev}`);
      }
      lines.push("");
    }

    lines.push(`**Notes:** ${assessment.notes}`);
    lines.push("");
  }

  // Gap Analysis
  lines.push("---");
  lines.push("## Gap Analysis");
  lines.push("");
  lines.push(`**Total Gaps Identified:** ${output.gapAnalysis.totalGaps}`);
  lines.push("");
  lines.push("| Severity | Count |");
  lines.push("|----------|-------|");
  lines.push(`| Critical | ${output.gapAnalysis.criticalGaps.length} |`);
  lines.push(`| High | ${output.gapAnalysis.highGaps.length} |`);
  lines.push(`| Medium | ${output.gapAnalysis.mediumGaps.length} |`);
  lines.push(`| Low | ${output.gapAnalysis.lowGaps.length} |`);
  lines.push("");

  // Critical Gaps Detail
  if (output.gapAnalysis.criticalGaps.length > 0) {
    lines.push("### Critical Gaps (Immediate Action Required)");
    lines.push("");
    for (const gap of output.gapAnalysis.criticalGaps) {
      lines.push(formatGapDetail(gap));
    }
  }

  // High Gaps Detail
  if (output.gapAnalysis.highGaps.length > 0) {
    lines.push("### High Severity Gaps");
    lines.push("");
    for (const gap of output.gapAnalysis.highGaps) {
      lines.push(formatGapDetail(gap));
    }
  }

  // Medium Gaps Detail
  if (output.gapAnalysis.mediumGaps.length > 0) {
    lines.push("### Medium Severity Gaps");
    lines.push("");
    for (const gap of output.gapAnalysis.mediumGaps) {
      lines.push(formatGapDetail(gap));
    }
  }

  // Low Gaps Detail
  if (output.gapAnalysis.lowGaps.length > 0) {
    lines.push("### Low Severity Gaps");
    lines.push("");
    for (const gap of output.gapAnalysis.lowGaps) {
      lines.push(formatGapDetail(gap));
    }
  }

  // Remediation Roadmap
  lines.push("---");
  lines.push("## Remediation Roadmap");
  lines.push("");
  lines.push(`**Total Estimated Timeline:** ${output.remediationRoadmap.totalEstimatedDays} days`);
  lines.push("");

  for (const phase of output.remediationRoadmap.phases) {
    lines.push(`### Phase ${phase.phaseNumber}: ${phase.name} (${phase.timelineDays} days)`);
    lines.push("");
    lines.push(phase.description);
    lines.push("");
    if (phase.gapIds.length > 0) {
      lines.push(`**Gaps Addressed:** ${phase.gapIds.join(", ")}`);
      lines.push("");
    }
    lines.push("**Milestones:**");
    for (const milestone of phase.milestones) {
      lines.push(`- [ ] ${milestone}`);
    }
    lines.push("");
    if (phase.dependencies.length > 0) {
      lines.push(`**Dependencies:** ${phase.dependencies.join(", ")}`);
      lines.push("");
    }
  }

  if (output.remediationRoadmap.quickWins.length > 0) {
    lines.push("### Quick Wins");
    lines.push("The following items can be resolved quickly with minimal effort:");
    for (const win of output.remediationRoadmap.quickWins) {
      lines.push(`- ${win}`);
    }
    lines.push("");
  }

  // Attestation of Compliance
  lines.push("---");
  lines.push("## Attestation of Compliance (AoC)");
  lines.push("");
  for (const section of output.attestationOfCompliance.sections) {
    lines.push(`### Section ${section.sectionId}: ${section.title}`);
    lines.push("");
    lines.push(section.content);
    lines.push("");
  }

  // Signature Block
  lines.push("### Signatures");
  lines.push("");
  const sig = output.attestationOfCompliance.signatureBlock;
  lines.push(`**Merchant Executive:** ${sig.merchantExecutiveName}`);
  lines.push(`**Title:** ${sig.merchantExecutiveTitle}`);
  lines.push(`**Date:** ${sig.attestationDate}`);
  lines.push("");
  lines.push(`**Assessor:** ${sig.assessorName}`);
  lines.push(`**Company:** ${sig.assessorCompany}`);
  lines.push(`**Date:** ${sig.attestationDate}`);
  lines.push("");

  // Footer
  lines.push("---");
  lines.push("*This report was generated based on PCI DSS v4.0 (March 2022). PCI DSS is a registered trademark of the PCI Security Standards Council LLC. This assessment does not constitute formal certification — formal certification requires validation by a QSA (Level 1) or submission to your acquiring bank (Levels 2-4).*");

  return lines.join("\n");
}

function formatGapDetail(gap: GapItem): string {
  const lines: string[] = [];
  lines.push(`#### ${gap.id} — Requirement ${gap.requirementId}: ${gap.requirementTitle}`);
  lines.push("");
  lines.push(`**Severity:** ${gap.severity.toUpperCase()}`);
  lines.push(`**Current State:** ${gap.currentState}`);
  lines.push(`**Required State:** ${gap.requiredState}`);
  lines.push(`**Description:** ${gap.description}`);
  lines.push(`**Business Impact:** ${gap.businessImpact}`);
  lines.push(`**Estimated Effort:** ${gap.estimatedEffort}`);
  lines.push(`**Estimated Timeline:** ${gap.estimatedTimelineDays} days`);
  lines.push("");
  lines.push("**Remediation Steps:**");
  for (let i = 0; i < gap.remediationSteps.length; i++) {
    lines.push(`${i + 1}. ${gap.remediationSteps[i]}`);
  }
  lines.push("");
  return lines.join("\n");
}

function getStatusIndicator(status: ComplianceStatus): string {
  switch (status) {
    case "compliant":
      return "[PASS]";
    case "non-compliant":
      return "[FAIL]";
    case "partially-compliant":
      return "[PARTIAL]";
    case "not-applicable":
      return "[N/A]";
  }
}

function formatStorageMethod(method: CardDataStorageMethod): string {
  const methodNames: Record<CardDataStorageMethod, string> = {
    none: "No electronic cardholder data stored",
    "tokenized-only": "Tokens only (no actual cardholder data)",
    "encrypted-pan": "PAN encrypted at rest",
    "truncated-pan": "Truncated PAN only (first 6/last 4)",
    "full-pan-encrypted": "Full PAN stored with strong encryption",
    "hashed-pan": "PAN stored as one-way hash",
    "paper-only": "Paper records only (no electronic storage)",
  };
  return methodNames[method];
}
