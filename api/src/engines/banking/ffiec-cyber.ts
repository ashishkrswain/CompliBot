import { generateCompletion } from "../../lib/llm.js";
import { parseReportSections } from "../../services/report-generator.js";
import type { GeneratedReport, GeneratedGap, GeneratedSection } from "../../services/report-generator.js";
import {
  INHERENT_RISK_CATEGORIES,
  MATURITY_DOMAINS,
  RISK_MATURITY_MAPPING,
  MATURITY_LEVEL_ORDER,
  INHERENT_RISK_ORDER,
} from "../../data/banking/ffiec-cat.js";
import type { InherentRiskLevel, MaturityLevel } from "../../data/banking/ffiec-cat.js";

interface CategoryRiskRating {
  categoryId: string;
  categoryName: string;
  rating: InherentRiskLevel;
  rationale: string;
  keyFactors: string[];
}

interface DomainMaturityRating {
  domainId: string;
  domainName: string;
  rating: MaturityLevel;
  rationale: string;
  strengths: string[];
  gaps: string[];
}

interface GapAnalysisItem {
  domain: string;
  currentMaturity: MaturityLevel;
  expectedMaturity: MaturityLevel;
  gapLevel: number;
  remediationPriority: "critical" | "high" | "medium" | "low";
  remediationActions: string[];
  estimatedTimeline: string;
}

export interface FFIECCyberInput {
  institutionName: string;
  assetSize: number;
  employeeCount: number;
  itStaffCount: number;
  securityStaffCount: number;
  infrastructure: {
    ispConnections: number;
    wirelessNetworks: boolean;
    cloudServices: string[];
    thirdPartyConnections: number;
    datacenters: number;
    endpointCount: number;
  };
  deliveryChannels: {
    onlineBanking: boolean;
    mobileBanking: boolean;
    mobileDepositCapture: boolean;
    atmCount: number;
    debitCards: boolean;
    creditCards: boolean;
    achOrigination: boolean;
    wireTransfers: boolean;
    realTimePayments: boolean;
  };
  productsAndServices: {
    achVolumeMonthly: number;
    wireVolumeMonthly: number;
    rdcCustomerCount: number;
    apiConnections: number;
    hostingForOthers: boolean;
  };
  organizationalCharacteristics: {
    mergerActivity: boolean;
    geographicDispersion: "single-location" | "single-state" | "multi-state" | "national" | "international";
    privilegedUsers: number;
    regulatoryActions: boolean;
  };
  externalThreats: {
    priorIncidents: number;
    priorBreaches: boolean;
    attackVolumeLevel: "low" | "moderate" | "high" | "critical";
    targetedAttacks: boolean;
  };
  currentControls: {
    mfaImplemented: boolean;
    mfaScope: string;
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    siemDeployed: boolean;
    edrDeployed: boolean;
    dlpDeployed: boolean;
    vulnerabilityScanning: boolean;
    scanFrequency: string;
    penetrationTesting: boolean;
    penTestFrequency: string;
    incidentResponsePlan: boolean;
    irPlanTested: boolean;
    irPlanTestDate: string;
    securityAwarenessTraining: boolean;
    trainingFrequency: string;
    vendorRiskProgram: boolean;
    backupsTested: boolean;
    businessContinuityPlan: boolean;
    bcpTestedDate: string;
    patchManagementProcess: boolean;
    patchSLA: string;
    networkSegmentation: boolean;
    firewallManaged: boolean;
    threatIntelligenceFeeds: boolean;
    fsIsacMember: boolean;
  };
}

export async function generateFFIECCyberReport(input: FFIECCyberInput): Promise<GeneratedReport> {
  const inherentRiskRatings = assessInherentRisk(input);
  const overallInherentRisk = calculateOverallInherentRisk(inherentRiskRatings);
  const maturityRatings = assessCybersecurityMaturity(input);
  const overallMaturity = calculateOverallMaturity(maturityRatings);
  const gapAnalysis = performGapAnalysis(overallInherentRisk, overallMaturity, maturityRatings);
  const remediationRoadmap = buildRemediationRoadmap(gapAnalysis);

  const systemPrompt = `You are a cybersecurity assessment expert generating an FFIEC Cybersecurity Assessment Tool (CAT) report. The assessment follows the FFIEC CAT methodology with:
- 5 inherent risk categories rated on a 5-level scale (Least, Minimal, Moderate, Significant, Most)
- 5 cybersecurity maturity domains rated on a 5-level scale (Baseline, Evolving, Intermediate, Advanced, Innovative)
- Gap analysis comparing actual maturity to expected maturity based on inherent risk
- Risk-based remediation roadmap

The output must be professional, suitable for regulatory examination, and reference FFIEC guidance.`;

  const additionalContext = buildCyberContext(input, inherentRiskRatings, overallInherentRisk, maturityRatings, overallMaturity, gapAnalysis);

  const rawContent = await generateCompletion(systemPrompt, additionalContext, {
    temperature: 0.2,
    maxTokens: 8192,
  });

  const llmSections = parseReportSections(rawContent);
  const gaps = identifyFFIECGaps(gapAnalysis, overallInherentRisk, overallMaturity);

  const sections: GeneratedSection[] = [
    buildInherentRiskProfileSection(inherentRiskRatings, overallInherentRisk),
    buildMaturityAssessmentSection(maturityRatings, overallMaturity),
    buildGapAnalysisSection(gapAnalysis, overallInherentRisk, overallMaturity),
    buildRemediationRoadmapSection(remediationRoadmap),
    ...llmSections,
  ];

  return {
    title: `FFIEC Cybersecurity Assessment — ${input.institutionName}`,
    summary: `FFIEC Cybersecurity Assessment Tool (CAT) evaluation for ${input.institutionName} ($${formatAssetSize(input.assetSize)} assets). Overall Inherent Risk Profile: ${overallInherentRisk.toUpperCase()}. Overall Cybersecurity Maturity: ${overallMaturity.toUpperCase()}. ${gapAnalysis.filter((g) => g.gapLevel > 0).length} domain(s) with maturity gaps requiring remediation.`,
    complianceScore: calculateCyberScore(overallInherentRisk, overallMaturity, gapAnalysis),
    sections,
    gaps,
  };
}

function assessInherentRisk(input: FFIECCyberInput): CategoryRiskRating[] {
  return [
    assessTechnologiesRisk(input),
    assessDeliveryChannelsRisk(input),
    assessOnlineMobileRisk(input),
    assessOrganizationalRisk(input),
    assessExternalThreatsRisk(input),
  ];
}

function assessTechnologiesRisk(input: FFIECCyberInput): CategoryRiskRating {
  const factors: string[] = [];
  let riskScore = 0;

  // ISP connections
  if (input.infrastructure.ispConnections > 15) { riskScore += 5; factors.push(`${input.infrastructure.ispConnections} ISP connections (Most risk)`); }
  else if (input.infrastructure.ispConnections > 5) { riskScore += 4; factors.push(`${input.infrastructure.ispConnections} ISP connections (Significant risk)`); }
  else if (input.infrastructure.ispConnections > 1) { riskScore += 3; factors.push(`${input.infrastructure.ispConnections} ISP connections (Moderate risk)`); }
  else { riskScore += 2; factors.push(`${input.infrastructure.ispConnections} ISP connection(s) (Minimal risk)`); }

  // Wireless
  if (input.infrastructure.wirelessNetworks) { riskScore += 3; factors.push("Wireless networks deployed"); }
  else { riskScore += 1; factors.push("No wireless networks"); }

  // Third-party connections
  if (input.infrastructure.thirdPartyConnections > 50) { riskScore += 5; factors.push(`${input.infrastructure.thirdPartyConnections} third-party connections (Most risk)`); }
  else if (input.infrastructure.thirdPartyConnections > 20) { riskScore += 4; factors.push(`${input.infrastructure.thirdPartyConnections} third-party connections (Significant risk)`); }
  else if (input.infrastructure.thirdPartyConnections > 5) { riskScore += 3; factors.push(`${input.infrastructure.thirdPartyConnections} third-party connections (Moderate risk)`); }
  else { riskScore += 2; factors.push(`${input.infrastructure.thirdPartyConnections} third-party connections (Minimal risk)`); }

  // Cloud services
  if (input.infrastructure.cloudServices.length > 5) { riskScore += 4; factors.push(`${input.infrastructure.cloudServices.length} cloud services (Significant risk)`); }
  else if (input.infrastructure.cloudServices.length > 2) { riskScore += 3; factors.push(`${input.infrastructure.cloudServices.length} cloud services (Moderate risk)`); }
  else if (input.infrastructure.cloudServices.length > 0) { riskScore += 2; factors.push(`${input.infrastructure.cloudServices.length} cloud service(s) (Minimal risk)`); }
  else { riskScore += 1; factors.push("No cloud services (Least risk)"); }

  const avgScore = riskScore / 4;
  const rating = scoreToInherentRisk(avgScore);

  return {
    categoryId: "technologies_connections",
    categoryName: "Technologies and Connection Types",
    rating,
    rationale: `Assessed based on ISP connections, wireless presence, third-party connections, and cloud service utilization per FFIEC CAT inherent risk profile methodology`,
    keyFactors: factors,
  };
}

function assessDeliveryChannelsRisk(input: FFIECCyberInput): CategoryRiskRating {
  const factors: string[] = [];
  let riskScore = 0;

  // Online banking
  if (input.deliveryChannels.onlineBanking && input.deliveryChannels.wireTransfers && input.deliveryChannels.achOrigination) {
    riskScore += 4; factors.push("Full-featured online banking with wire and ACH origination");
  } else if (input.deliveryChannels.onlineBanking) {
    riskScore += 3; factors.push("Online banking with standard features");
  } else {
    riskScore += 1; factors.push("No online banking");
  }

  // Mobile banking
  if (input.deliveryChannels.mobileBanking && input.deliveryChannels.mobileDepositCapture) {
    riskScore += 4; factors.push("Mobile banking with RDC");
  } else if (input.deliveryChannels.mobileBanking) {
    riskScore += 3; factors.push("Mobile banking (standard)");
  } else {
    riskScore += 1; factors.push("No mobile banking");
  }

  // ATMs
  if (input.deliveryChannels.atmCount > 200) { riskScore += 5; factors.push(`${input.deliveryChannels.atmCount} ATMs (Most risk)`); }
  else if (input.deliveryChannels.atmCount > 50) { riskScore += 4; factors.push(`${input.deliveryChannels.atmCount} ATMs (Significant risk)`); }
  else if (input.deliveryChannels.atmCount > 10) { riskScore += 3; factors.push(`${input.deliveryChannels.atmCount} ATMs (Moderate risk)`); }
  else if (input.deliveryChannels.atmCount > 0) { riskScore += 2; factors.push(`${input.deliveryChannels.atmCount} ATMs (Minimal risk)`); }
  else { riskScore += 1; factors.push("No ATMs"); }

  // Cards
  if (input.deliveryChannels.creditCards && input.deliveryChannels.debitCards) {
    riskScore += 3; factors.push("Credit and debit card programs");
  } else if (input.deliveryChannels.debitCards) {
    riskScore += 2; factors.push("Debit card program only");
  } else {
    riskScore += 1; factors.push("No card programs");
  }

  const avgScore = riskScore / 4;
  const rating = scoreToInherentRisk(avgScore);

  return {
    categoryId: "delivery_channels",
    categoryName: "Delivery Channels",
    rating,
    rationale: "Assessed based on electronic delivery channel complexity including online banking, mobile services, ATM network, and card programs",
    keyFactors: factors,
  };
}

function assessOnlineMobileRisk(input: FFIECCyberInput): CategoryRiskRating {
  const factors: string[] = [];
  let riskScore = 0;

  // ACH volume
  if (input.productsAndServices.achVolumeMonthly > 50000) { riskScore += 5; factors.push(`${input.productsAndServices.achVolumeMonthly.toLocaleString()} monthly ACH (Most risk)`); }
  else if (input.productsAndServices.achVolumeMonthly > 5000) { riskScore += 4; factors.push(`${input.productsAndServices.achVolumeMonthly.toLocaleString()} monthly ACH (Significant risk)`); }
  else if (input.productsAndServices.achVolumeMonthly > 500) { riskScore += 3; factors.push(`${input.productsAndServices.achVolumeMonthly.toLocaleString()} monthly ACH (Moderate risk)`); }
  else if (input.productsAndServices.achVolumeMonthly > 0) { riskScore += 2; factors.push(`${input.productsAndServices.achVolumeMonthly.toLocaleString()} monthly ACH (Minimal risk)`); }
  else { riskScore += 1; factors.push("No ACH origination"); }

  // Wire volume
  if (input.productsAndServices.wireVolumeMonthly > 5000) { riskScore += 5; factors.push(`${input.productsAndServices.wireVolumeMonthly.toLocaleString()} monthly wires (Most risk)`); }
  else if (input.productsAndServices.wireVolumeMonthly > 500) { riskScore += 4; factors.push(`${input.productsAndServices.wireVolumeMonthly.toLocaleString()} monthly wires (Significant risk)`); }
  else if (input.productsAndServices.wireVolumeMonthly > 50) { riskScore += 3; factors.push(`${input.productsAndServices.wireVolumeMonthly.toLocaleString()} monthly wires (Moderate risk)`); }
  else if (input.productsAndServices.wireVolumeMonthly > 0) { riskScore += 2; factors.push(`${input.productsAndServices.wireVolumeMonthly.toLocaleString()} monthly wires (Minimal risk)`); }
  else { riskScore += 1; factors.push("No wire transfer capability"); }

  // RDC
  if (input.productsAndServices.rdcCustomerCount > 100) { riskScore += 4; factors.push(`${input.productsAndServices.rdcCustomerCount} RDC customers (Significant risk)`); }
  else if (input.productsAndServices.rdcCustomerCount > 0) { riskScore += 3; factors.push(`${input.productsAndServices.rdcCustomerCount} RDC customers (Moderate risk)`); }
  else { riskScore += 1; factors.push("No RDC services"); }

  // Hosting
  if (input.productsAndServices.hostingForOthers) { riskScore += 4; factors.push("Provides technology services to others (Significant risk)"); }
  else { riskScore += 1; factors.push("No hosting/TSP services"); }

  const avgScore = riskScore / 4;
  const rating = scoreToInherentRisk(avgScore);

  return {
    categoryId: "online_mobile_products",
    categoryName: "Online/Mobile Products and Technology Services",
    rating,
    rationale: "Assessed based on ACH/wire volumes, RDC deployment, API connections, and technology service provider activity",
    keyFactors: factors,
  };
}

function assessOrganizationalRisk(input: FFIECCyberInput): CategoryRiskRating {
  const factors: string[] = [];
  let riskScore = 0;

  // Asset size
  if (input.assetSize > 50_000_000_000) { riskScore += 5; factors.push(`$${formatAssetSize(input.assetSize)} assets (Most risk)`); }
  else if (input.assetSize > 5_000_000_000) { riskScore += 4; factors.push(`$${formatAssetSize(input.assetSize)} assets (Significant risk)`); }
  else if (input.assetSize > 500_000_000) { riskScore += 3; factors.push(`$${formatAssetSize(input.assetSize)} assets (Moderate risk)`); }
  else if (input.assetSize > 100_000_000) { riskScore += 2; factors.push(`$${formatAssetSize(input.assetSize)} assets (Minimal risk)`); }
  else { riskScore += 1; factors.push(`$${formatAssetSize(input.assetSize)} assets (Least risk)`); }

  // Privileged users
  if (input.organizationalCharacteristics.privilegedUsers > 200) { riskScore += 5; factors.push(`${input.organizationalCharacteristics.privilegedUsers} privileged users (Most risk)`); }
  else if (input.organizationalCharacteristics.privilegedUsers > 50) { riskScore += 4; factors.push(`${input.organizationalCharacteristics.privilegedUsers} privileged users (Significant risk)`); }
  else if (input.organizationalCharacteristics.privilegedUsers > 20) { riskScore += 3; factors.push(`${input.organizationalCharacteristics.privilegedUsers} privileged users (Moderate risk)`); }
  else { riskScore += 2; factors.push(`${input.organizationalCharacteristics.privilegedUsers} privileged users (Minimal risk)`); }

  // Geographic dispersion
  const geoScoreMap: Record<string, number> = { "single-location": 1, "single-state": 2, "multi-state": 3, "national": 4, "international": 5 };
  const geoScore = geoScoreMap[input.organizationalCharacteristics.geographicDispersion] ?? 3;
  riskScore += geoScore;
  factors.push(`Geographic dispersion: ${input.organizationalCharacteristics.geographicDispersion}`);

  // M&A
  if (input.organizationalCharacteristics.mergerActivity) { riskScore += 4; factors.push("Active merger/acquisition/integration activity"); }
  else { riskScore += 1; factors.push("No M&A activity"); }

  const avgScore = riskScore / 4;
  const rating = scoreToInherentRisk(avgScore);

  return {
    categoryId: "organizational_characteristics",
    categoryName: "Organizational Characteristics",
    rating,
    rationale: "Assessed based on asset size, privileged user count, geographic dispersion, and M&A activity",
    keyFactors: factors,
  };
}

function assessExternalThreatsRisk(input: FFIECCyberInput): CategoryRiskRating {
  const factors: string[] = [];
  let riskScore = 0;

  // Attack volume
  const volumeMap: Record<string, number> = { low: 2, moderate: 3, high: 4, critical: 5 };
  riskScore += volumeMap[input.externalThreats.attackVolumeLevel] ?? 3;
  factors.push(`Attack volume: ${input.externalThreats.attackVolumeLevel}`);

  // Prior incidents
  if (input.externalThreats.priorBreaches) { riskScore += 5; factors.push("Prior breach within assessment period (Most risk)"); }
  else if (input.externalThreats.priorIncidents > 3) { riskScore += 4; factors.push(`${input.externalThreats.priorIncidents} significant incidents (Significant risk)`); }
  else if (input.externalThreats.priorIncidents > 0) { riskScore += 3; factors.push(`${input.externalThreats.priorIncidents} incident(s) (Moderate risk)`); }
  else { riskScore += 1; factors.push("No significant incidents (Least risk)"); }

  // Targeted attacks
  if (input.externalThreats.targetedAttacks) { riskScore += 4; factors.push("Institution targeted by sophisticated attacks"); }
  else { riskScore += 2; factors.push("No specific targeting identified"); }

  const avgScore = riskScore / 3;
  const rating = scoreToInherentRisk(avgScore);

  return {
    categoryId: "external_threats",
    categoryName: "External Threats",
    rating,
    rationale: "Assessed based on observed attack volume, prior incident history, and targeted threat intelligence",
    keyFactors: factors,
  };
}

function assessCybersecurityMaturity(input: FFIECCyberInput): DomainMaturityRating[] {
  return [
    assessCyberRiskManagement(input),
    assessThreatIntelligence(input),
    assessCybersecurityControls(input),
    assessExternalDependency(input),
    assessIncidentResilience(input),
  ];
}

function assessCyberRiskManagement(input: FFIECCyberInput): DomainMaturityRating {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (input.securityStaffCount > 0) { score += 2; strengths.push("Dedicated security staff"); }
  else { score += 1; gaps.push("No dedicated security staff identified"); }

  if (input.currentControls.vendorRiskProgram) { score += 2; strengths.push("Vendor risk management program in place"); }
  else { gaps.push("No vendor risk management program"); }

  if (input.currentControls.penetrationTesting) { score += 2; strengths.push(`Penetration testing (${input.currentControls.penTestFrequency})`); }
  else { gaps.push("No penetration testing program"); }

  if (input.currentControls.vulnerabilityScanning) { score += 1; strengths.push(`Vulnerability scanning (${input.currentControls.scanFrequency})`); }
  else { gaps.push("No vulnerability scanning"); }

  const avgScore = score / 4;
  const rating = scoreToMaturity(avgScore);

  return {
    domainId: "cyber_risk_mgmt",
    domainName: "Cyber Risk Management and Oversight",
    rating,
    rationale: "Assessed governance structure, risk assessment practices, security staffing, and vulnerability management program",
    strengths,
    gaps,
  };
}

function assessThreatIntelligence(input: FFIECCyberInput): DomainMaturityRating {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (input.currentControls.threatIntelligenceFeeds) { score += 2; strengths.push("Threat intelligence feeds active"); }
  else { score += 1; gaps.push("No threat intelligence feeds"); }

  if (input.currentControls.fsIsacMember) { score += 2; strengths.push("FS-ISAC membership active"); }
  else { gaps.push("Not an FS-ISAC member"); }

  if (input.currentControls.siemDeployed) { score += 1; strengths.push("SIEM enables threat correlation"); }
  else { gaps.push("No SIEM for threat correlation"); }

  const avgScore = score / 3;
  const rating = scoreToMaturity(avgScore);

  return {
    domainId: "threat_intelligence",
    domainName: "Threat Intelligence and Collaboration",
    rating,
    rationale: "Assessed threat intelligence sources, information sharing participation, and integration into operations",
    strengths,
    gaps,
  };
}

function assessCybersecurityControls(input: FFIECCyberInput): DomainMaturityRating {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  // Access controls
  if (input.currentControls.mfaImplemented) { score += 2; strengths.push(`MFA deployed (${input.currentControls.mfaScope})`); }
  else { gaps.push("No multi-factor authentication"); }

  // Encryption
  if (input.currentControls.encryptionAtRest && input.currentControls.encryptionInTransit) { score += 2; strengths.push("Encryption at rest and in transit"); }
  else if (input.currentControls.encryptionInTransit) { score += 1; strengths.push("Encryption in transit only"); gaps.push("No encryption at rest"); }
  else { gaps.push("Encryption not comprehensively deployed"); }

  // Detection
  if (input.currentControls.siemDeployed && input.currentControls.edrDeployed) { score += 2; strengths.push("SIEM and EDR deployed"); }
  else if (input.currentControls.siemDeployed || input.currentControls.edrDeployed) { score += 1; strengths.push(input.currentControls.siemDeployed ? "SIEM deployed" : "EDR deployed"); }
  else { gaps.push("No SIEM or EDR"); }

  // Infrastructure management
  if (input.currentControls.patchManagementProcess && input.currentControls.networkSegmentation && input.currentControls.firewallManaged) {
    score += 2; strengths.push("Patch management, segmentation, and firewall controls");
  } else {
    if (!input.currentControls.patchManagementProcess) gaps.push("No formal patch management");
    if (!input.currentControls.networkSegmentation) gaps.push("No network segmentation");
    if (!input.currentControls.firewallManaged) gaps.push("No managed firewall");
    score += 1;
  }

  // DLP
  if (input.currentControls.dlpDeployed) { score += 1; strengths.push("DLP deployed"); }
  else { gaps.push("No data loss prevention"); }

  // Training
  if (input.currentControls.securityAwarenessTraining) { score += 1; strengths.push(`Security awareness training (${input.currentControls.trainingFrequency})`); }
  else { gaps.push("No security awareness training"); }

  const avgScore = score / 6;
  const rating = scoreToMaturity(avgScore);

  return {
    domainId: "cybersecurity_controls",
    domainName: "Cybersecurity Controls",
    rating,
    rationale: "Assessed preventative and detective controls including access management, encryption, monitoring, infrastructure hardening, and training",
    strengths,
    gaps,
  };
}

function assessExternalDependency(input: FFIECCyberInput): DomainMaturityRating {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (input.currentControls.vendorRiskProgram) { score += 2; strengths.push("Vendor risk management program established"); }
  else { gaps.push("No formal vendor risk management program"); }

  if (input.infrastructure.thirdPartyConnections <= 20) { score += 1; strengths.push("Manageable third-party connection count"); }
  else { gaps.push(`High third-party connection count (${input.infrastructure.thirdPartyConnections}) increases surface area`); }

  if (input.infrastructure.cloudServices.length > 0 && input.currentControls.vendorRiskProgram) {
    score += 1; strengths.push("Cloud services covered under vendor risk program");
  } else if (input.infrastructure.cloudServices.length > 0) {
    gaps.push("Cloud services deployed without formal vendor risk oversight");
  }

  const avgScore = score / 3;
  const rating = scoreToMaturity(avgScore);

  return {
    domainId: "external_dependency",
    domainName: "External Dependency Management",
    rating,
    rationale: "Assessed vendor risk program maturity, third-party connection management, and cloud governance",
    strengths,
    gaps,
  };
}

function assessIncidentResilience(input: FFIECCyberInput): DomainMaturityRating {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (input.currentControls.incidentResponsePlan) { score += 1; strengths.push("Written incident response plan"); }
  else { gaps.push("No incident response plan"); }

  if (input.currentControls.irPlanTested) { score += 2; strengths.push(`IR plan tested (${input.currentControls.irPlanTestDate})`); }
  else if (input.currentControls.incidentResponsePlan) { gaps.push("IR plan not tested"); }

  if (input.currentControls.businessContinuityPlan) { score += 1; strengths.push("Business continuity plan in place"); }
  else { gaps.push("No business continuity plan"); }

  if (input.currentControls.backupsTested) { score += 2; strengths.push("Backup restoration tested"); }
  else { gaps.push("Backups not tested for restoration"); }

  const avgScore = score / 4;
  const rating = scoreToMaturity(avgScore);

  return {
    domainId: "incident_resilience",
    domainName: "Cyber Incident Management and Resilience",
    rating,
    rationale: "Assessed incident response planning, testing, business continuity, and backup/recovery capabilities",
    strengths,
    gaps,
  };
}

function performGapAnalysis(overallRisk: InherentRiskLevel, overallMaturity: MaturityLevel, domainRatings: DomainMaturityRating[]): GapAnalysisItem[] {
  const expectedMaturity = getExpectedMaturity(overallRisk);

  return domainRatings.map((domain) => {
    const currentIdx = MATURITY_LEVEL_ORDER.indexOf(domain.rating);
    const expectedIdx = MATURITY_LEVEL_ORDER.indexOf(expectedMaturity);
    const gapLevel = Math.max(0, expectedIdx - currentIdx);

    let remediationPriority: GapAnalysisItem["remediationPriority"];
    if (gapLevel >= 3) remediationPriority = "critical";
    else if (gapLevel >= 2) remediationPriority = "high";
    else if (gapLevel >= 1) remediationPriority = "medium";
    else remediationPriority = "low";

    const remediationActions = buildRemediationActions(domain, expectedMaturity, gapLevel);
    const estimatedTimeline = gapLevel >= 3 ? "6-12 months" : gapLevel >= 2 ? "3-6 months" : gapLevel >= 1 ? "1-3 months" : "Maintenance";

    return {
      domain: domain.domainName,
      currentMaturity: domain.rating,
      expectedMaturity,
      gapLevel,
      remediationPriority,
      remediationActions,
      estimatedTimeline,
    };
  });
}

function buildRemediationActions(domain: DomainMaturityRating, expectedMaturity: MaturityLevel, gapLevel: number): string[] {
  if (gapLevel === 0) return ["Maintain current posture; continue regular assessment"];

  const actions: string[] = [];

  for (const gap of domain.gaps) {
    actions.push(`Address gap: ${gap}`);
  }

  // Add domain-specific remediation based on expected maturity
  const expectedIdx = MATURITY_LEVEL_ORDER.indexOf(expectedMaturity);
  if (expectedIdx >= 2) { // Intermediate or above
    switch (domain.domainId) {
      case "cyber_risk_mgmt":
        actions.push("Implement formal risk assessment methodology with quantitative analysis");
        actions.push("Establish dedicated CISO role with board reporting");
        break;
      case "threat_intelligence":
        actions.push("Deploy dedicated threat intelligence platform");
        actions.push("Establish bi-directional sharing with sector partners");
        break;
      case "cybersecurity_controls":
        actions.push("Deploy 24/7 monitoring capability (SOC or managed service)");
        actions.push("Implement privileged access management (PAM)");
        break;
      case "external_dependency":
        actions.push("Implement continuous vendor monitoring");
        actions.push("Assess fourth-party (subcontractor) risk");
        break;
      case "incident_resilience":
        actions.push("Conduct technical incident response exercises");
        actions.push("Implement immutable backup strategy (ransomware resilience)");
        break;
    }
  }

  return actions;
}

function buildRemediationRoadmap(gapAnalysis: GapAnalysisItem[]): GapAnalysisItem[] {
  // Sort by priority: critical first, then high, medium, low
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...gapAnalysis].sort((a, b) => (priorityOrder[a.remediationPriority] ?? 3) - (priorityOrder[b.remediationPriority] ?? 3));
}

function calculateOverallInherentRisk(ratings: CategoryRiskRating[]): InherentRiskLevel {
  const riskValues: Record<InherentRiskLevel, number> = { least: 1, minimal: 2, moderate: 3, significant: 4, most: 5 };
  const avgScore = ratings.reduce((sum, r) => sum + riskValues[r.rating], 0) / ratings.length;
  return scoreToInherentRisk(avgScore);
}

function calculateOverallMaturity(ratings: DomainMaturityRating[]): MaturityLevel {
  const maturityValues: Record<MaturityLevel, number> = { baseline: 1, evolving: 2, intermediate: 3, advanced: 4, innovative: 5 };
  const avgScore = ratings.reduce((sum, r) => sum + maturityValues[r.rating], 0) / ratings.length;
  return scoreToMaturity(avgScore);
}

function getExpectedMaturity(inherentRisk: InherentRiskLevel): MaturityLevel {
  const mapping = RISK_MATURITY_MAPPING.find((m) => m.inherentRiskLevel === inherentRisk);
  return mapping?.minimumExpectedMaturity ?? "baseline";
}

function scoreToInherentRisk(score: number): InherentRiskLevel {
  if (score >= 4.5) return "most";
  if (score >= 3.5) return "significant";
  if (score >= 2.5) return "moderate";
  if (score >= 1.5) return "minimal";
  return "least";
}

function scoreToMaturity(score: number): MaturityLevel {
  if (score >= 4.5) return "innovative";
  if (score >= 3.5) return "advanced";
  if (score >= 2.5) return "intermediate";
  if (score >= 1.5) return "evolving";
  return "baseline";
}

function buildInherentRiskProfileSection(ratings: CategoryRiskRating[], overall: InherentRiskLevel): GeneratedSection {
  const riskTable = ratings.map((r) =>
    `| ${r.categoryName} | ${r.rating.toUpperCase()} | ${r.keyFactors.slice(0, 3).join("; ")} |`
  ).join("\n");

  return {
    order: 1,
    title: "Inherent Risk Profile",
    content: `## Inherent Risk Profile — Overall: ${overall.toUpperCase()}
Per FFIEC Cybersecurity Assessment Tool methodology, inherent risk is assessed across five categories on a five-level scale: Least, Minimal, Moderate, Significant, Most.

### Category Ratings
| Category | Rating | Key Factors |
|---|---|---|
${riskTable}

### Overall Inherent Risk: ${overall.toUpperCase()}
${INHERENT_RISK_CATEGORIES.map((cat) => {
  const rating = ratings.find((r) => r.categoryId === cat.id);
  return `#### ${cat.name}: ${rating?.rating.toUpperCase() ?? "NOT ASSESSED"}
${rating?.rationale ?? ""}
Key factors:
${rating?.keyFactors.map((f) => `- ${f}`).join("\n") ?? ""}`;
}).join("\n\n")}`,
    citations: ["FFIEC Cybersecurity Assessment Tool — Inherent Risk Profile"],
    findings: ratings.filter((r) => INHERENT_RISK_ORDER.indexOf(r.rating) >= 3).map((r) => `${r.categoryName}: ${r.rating.toUpperCase()}`),
    recommendations: [],
  };
}

function buildMaturityAssessmentSection(ratings: DomainMaturityRating[], overall: MaturityLevel): GeneratedSection {
  const maturityTable = ratings.map((r) =>
    `| ${r.domainName} | ${r.rating.toUpperCase()} | ${r.strengths.length} | ${r.gaps.length} |`
  ).join("\n");

  return {
    order: 2,
    title: "Cybersecurity Maturity Assessment",
    content: `## Cybersecurity Maturity — Overall: ${overall.toUpperCase()}
Per FFIEC CAT methodology, maturity is assessed across five domains on a five-level scale: Baseline, Evolving, Intermediate, Advanced, Innovative.

### Domain Ratings
| Domain | Maturity Level | Strengths | Gaps |
|---|---|---|---|
${maturityTable}

${ratings.map((r) => `#### ${r.domainName}: ${r.rating.toUpperCase()}
${r.rationale}

Strengths:
${r.strengths.map((s) => `- ${s}`).join("\n")}

Gaps:
${r.gaps.length > 0 ? r.gaps.map((g) => `- ${g}`).join("\n") : "- No significant gaps identified"}`).join("\n\n")}`,
    citations: ["FFIEC Cybersecurity Assessment Tool — Cybersecurity Maturity"],
    findings: ratings.flatMap((r) => r.gaps),
    recommendations: ratings.flatMap((r) => r.gaps.map((g) => `Remediate: ${g}`)),
  };
}

function buildGapAnalysisSection(gapAnalysis: GapAnalysisItem[], overallRisk: InherentRiskLevel, overallMaturity: MaturityLevel): GeneratedSection {
  const expectedMaturity = getExpectedMaturity(overallRisk);
  const overallGap = MATURITY_LEVEL_ORDER.indexOf(expectedMaturity) - MATURITY_LEVEL_ORDER.indexOf(overallMaturity);

  const gapTable = gapAnalysis.map((g) =>
    `| ${g.domain} | ${g.currentMaturity.toUpperCase()} | ${g.expectedMaturity.toUpperCase()} | ${g.gapLevel > 0 ? g.gapLevel + " level(s)" : "None"} | ${g.remediationPriority.toUpperCase()} |`
  ).join("\n");

  return {
    order: 3,
    title: "Gap Analysis",
    content: `## Gap Analysis — Risk vs. Maturity
Per FFIEC CAT methodology, institutions should achieve a cybersecurity maturity level commensurate with their inherent risk profile.

### Expected Maturity for ${overallRisk.toUpperCase()} Inherent Risk: ${expectedMaturity.toUpperCase()}
${RISK_MATURITY_MAPPING.find((m) => m.inherentRiskLevel === overallRisk)?.description ?? ""}

### Overall Gap Assessment
- **Inherent Risk Level:** ${overallRisk.toUpperCase()}
- **Current Maturity:** ${overallMaturity.toUpperCase()}
- **Expected Maturity:** ${expectedMaturity.toUpperCase()}
- **Overall Gap:** ${overallGap > 0 ? `${overallGap} level(s) below expected` : "Meets or exceeds expectations"}

### Domain-Level Gap Analysis
| Domain | Current | Expected | Gap | Priority |
|---|---|---|---|---|
${gapTable}

### Risk/Maturity Matrix
|  | Baseline | Evolving | Intermediate | Advanced | Innovative |
|---|---|---|---|---|---|
| **Least** | ${overallRisk === "least" && overallMaturity === "baseline" ? ">>CURRENT<<" : "Min"} | | | | |
| **Minimal** | ${overallRisk === "minimal" ? "Min" : ""} | | | | |
| **Moderate** | | ${overallRisk === "moderate" && overallMaturity === "evolving" ? ">>CURRENT<<" : overallRisk === "moderate" ? "Min" : ""} | | | |
| **Significant** | | | ${overallRisk === "significant" && overallMaturity === "intermediate" ? ">>CURRENT<<" : overallRisk === "significant" ? "Min" : ""} | | |
| **Most** | | | | ${overallRisk === "most" && overallMaturity === "advanced" ? ">>CURRENT<<" : overallRisk === "most" ? "Min" : ""} | |`,
    citations: ["FFIEC Cybersecurity Assessment Tool — Risk/Maturity Relationship"],
    findings: gapAnalysis.filter((g) => g.gapLevel > 0).map((g) => `${g.domain}: ${g.gapLevel} level(s) below expected maturity`),
    recommendations: gapAnalysis.filter((g) => g.gapLevel > 0).flatMap((g) => g.remediationActions),
  };
}

function buildRemediationRoadmapSection(roadmap: GapAnalysisItem[]): GeneratedSection {
  const actionableItems = roadmap.filter((r) => r.gapLevel > 0);

  const roadmapContent = actionableItems.map((item, idx) => `### ${idx + 1}. ${item.domain} (Priority: ${item.remediationPriority.toUpperCase()})
**Current:** ${item.currentMaturity.toUpperCase()} | **Target:** ${item.expectedMaturity.toUpperCase()} | **Timeline:** ${item.estimatedTimeline}

Actions:
${item.remediationActions.map((a) => `- ${a}`).join("\n")}`).join("\n\n");

  return {
    order: 4,
    title: "Remediation Roadmap",
    content: `## Remediation Roadmap
Prioritized actions to close identified maturity gaps, ordered by criticality.

${actionableItems.length > 0 ? roadmapContent : "No remediation required — all domains meet or exceed expected maturity for the institution's inherent risk profile."}

### Implementation Phases
- **Phase 1 (0-3 months):** Address critical and high-priority gaps
- **Phase 2 (3-6 months):** Address medium-priority gaps and begin advanced capability development
- **Phase 3 (6-12 months):** Complete all remediation; validate through independent assessment`,
    citations: ["FFIEC Cybersecurity Assessment Tool — Cybersecurity Maturity"],
    findings: [],
    recommendations: actionableItems.flatMap((i) => i.remediationActions),
  };
}

function identifyFFIECGaps(gapAnalysis: GapAnalysisItem[], overallRisk: InherentRiskLevel, overallMaturity: MaturityLevel): GeneratedGap[] {
  const gaps: GeneratedGap[] = [];

  for (const item of gapAnalysis) {
    if (item.gapLevel > 0) {
      gaps.push({
        standard: "FFIEC Cybersecurity Assessment Tool",
        requirement: `${item.domain} maturity must be at least ${item.expectedMaturity.toUpperCase()} for institutions with ${overallRisk.toUpperCase()} inherent risk`,
        currentState: `Current maturity: ${item.currentMaturity.toUpperCase()}; Expected: ${item.expectedMaturity.toUpperCase()}; Gap: ${item.gapLevel} level(s)`,
        severity: item.remediationPriority === "critical" ? "critical" : item.remediationPriority === "high" ? "high" : "medium",
        recommendedAction: item.remediationActions.slice(0, 3).join("; "),
      });
    }
  }

  const overallGap = MATURITY_LEVEL_ORDER.indexOf(getExpectedMaturity(overallRisk)) - MATURITY_LEVEL_ORDER.indexOf(overallMaturity);
  if (overallGap > 1) {
    gaps.push({
      standard: "FFIEC Cybersecurity Assessment Tool / Regulatory Expectation",
      requirement: "Overall cybersecurity maturity must be commensurate with the institution's inherent risk profile per FFIEC guidance",
      currentState: `Overall maturity (${overallMaturity.toUpperCase()}) is ${overallGap} levels below expected maturity (${getExpectedMaturity(overallRisk).toUpperCase()}) for ${overallRisk.toUpperCase()} inherent risk profile`,
      severity: "critical",
      recommendedAction: "Develop comprehensive cybersecurity improvement plan with board approval; engage qualified cybersecurity firm; provide regular progress reporting to board and regulators",
    });
  }

  return gaps;
}

function calculateCyberScore(overallRisk: InherentRiskLevel, overallMaturity: MaturityLevel, gapAnalysis: GapAnalysisItem[]): number {
  const expectedMaturity = getExpectedMaturity(overallRisk);
  const currentIdx = MATURITY_LEVEL_ORDER.indexOf(overallMaturity);
  const expectedIdx = MATURITY_LEVEL_ORDER.indexOf(expectedMaturity);

  if (currentIdx >= expectedIdx) return 90;
  const gap = expectedIdx - currentIdx;
  const criticalGaps = gapAnalysis.filter((g) => g.remediationPriority === "critical").length;

  let score = 90 - (gap * 15) - (criticalGaps * 10);
  return Math.max(0, Math.min(100, score));
}

function buildCyberContext(
  input: FFIECCyberInput,
  riskRatings: CategoryRiskRating[],
  overallRisk: InherentRiskLevel,
  maturityRatings: DomainMaturityRating[],
  overallMaturity: MaturityLevel,
  gapAnalysis: GapAnalysisItem[]
): string {
  return `Generate supplemental FFIEC Cybersecurity Assessment analysis.

INSTITUTION: ${input.institutionName}
ASSETS: $${formatAssetSize(input.assetSize)}
EMPLOYEES: ${input.employeeCount} total, ${input.itStaffCount} IT, ${input.securityStaffCount} security
ENDPOINTS: ${input.infrastructure.endpointCount}

ASSESSMENT RESULTS (already calculated):
- Overall Inherent Risk: ${overallRisk.toUpperCase()}
- Overall Maturity: ${overallMaturity.toUpperCase()}
- Expected Maturity: ${getExpectedMaturity(overallRisk).toUpperCase()}
- Domains with gaps: ${gapAnalysis.filter((g) => g.gapLevel > 0).length} of 5

RISK CATEGORY RATINGS:
${riskRatings.map((r) => `- ${r.categoryName}: ${r.rating.toUpperCase()}`).join("\n")}

MATURITY DOMAIN RATINGS:
${maturityRatings.map((r) => `- ${r.domainName}: ${r.rating.toUpperCase()}`).join("\n")}

KEY GAPS:
${maturityRatings.flatMap((r) => r.gaps).join("\n- ")}

KEY STRENGTHS:
${maturityRatings.flatMap((r) => r.strengths).join("\n- ")}

Generate:
1. Executive summary for board presentation
2. Comparison to peer institutions (general guidance for similar size/complexity)
3. Regulatory expectations discussion
4. Specific technology recommendations for gap closure
5. Budget considerations for remediation
6. Timeline and milestone recommendations`;
}

function formatAssetSize(assets: number): string {
  if (assets >= 1_000_000_000) return `${(assets / 1_000_000_000).toFixed(1)}B`;
  if (assets >= 1_000_000) return `${(assets / 1_000_000).toFixed(0)}M`;
  return assets.toLocaleString();
}
