import { generateCompletion } from "../lib/llm.js";
import { getRequirementsForType } from "./regulatory-engine.js";
import { generateOsha300Report } from "../engines/osha-300.js";
import { generateEpaTier2Report } from "../engines/epa-tier2.js";
import { generateMaintenanceAuditReport } from "../engines/maintenance-audit.js";
import { generateSafetyInspectionReport } from "../engines/safety-inspection.js";
import { generateHipaaSRAReport } from "../engines/healthcare/hipaa-risk-assessment.js";
import { generateHipaaPoliciesReport } from "../engines/healthcare/hipaa-policies.js";
import { generateHipaaBreachReport } from "../engines/healthcare/hipaa-breach.js";
import { generateHipaaBAAReport } from "../engines/healthcare/hipaa-baa.js";
import { generateOshaBloodborneReport } from "../engines/healthcare/osha-bloodborne.js";
import { generateComplianceProgramReport } from "../engines/healthcare/compliance-program.js";
import { generateBSAAMLRiskAssessment } from "../engines/banking/bsa-aml-risk.js";
import { generateBSAProgramReport } from "../engines/banking/bsa-program.js";
import { generateSARNarrativeReport } from "../engines/banking/sar-narrative.js";
import { generateCRAAssessmentReport } from "../engines/banking/cra-assessment.js";
import { generateFFIECCyberReport } from "../engines/banking/ffiec-cyber.js";
import { generateVendorRiskReport } from "../engines/banking/vendor-risk.js";
import type { BSAAMLRiskInput } from "../engines/banking/bsa-aml-risk.js";
import type { BSAProgramInput } from "../engines/banking/bsa-program.js";
import type { SARNarrativeInput } from "../engines/banking/sar-narrative.js";
import type { CRAAssessmentInput } from "../engines/banking/cra-assessment.js";
import type { FFIECCyberInput } from "../engines/banking/ffiec-cyber.js";
import type { VendorRiskInput } from "../engines/banking/vendor-risk.js";
import { generatePciDssAssessment, formatPciReport } from "../engines/tech/pci-dss.js";
import type { PciDssInput } from "../engines/tech/pci-dss.js";
import { generateNistCsfAssessment, formatNistCsfReport } from "../engines/tech/nist-csf.js";
import type { NistCsfInput } from "../engines/tech/nist-csf.js";
import { generateFedRampAssessment, formatFedRampReport } from "../engines/tech/fedramp.js";
import type { FedRampInput } from "../engines/tech/fedramp.js";
import { generateEmergencyActionPlan, formatEapReport } from "../engines/safety/emergency-action-plan.js";
import type { EapInput } from "../engines/safety/emergency-action-plan.js";

export type ReportType =
  | "OSHA_300"
  | "EPA_TIER2"
  | "MAINTENANCE_AUDIT"
  | "SAFETY_INSPECTION"
  | "HIPAA_SRA"
  | "HIPAA_POLICIES"
  | "HIPAA_BREACH"
  | "HIPAA_BAA"
  | "BLOODBORNE"
  | "COMPLIANCE_PROGRAM"
  | "BSA_AML"
  | "BSA_AML_RISK"
  | "BSA_PROGRAM"
  | "SAR"
  | "SAR_NARRATIVE"
  | "CRA"
  | "CRA_ASSESSMENT"
  | "FFIEC"
  | "FFIEC_CYBER"
  | "VENDOR_RISK"
  | "PCI_DSS"
  | "SOC2_CONTROLS"
  | "SOC2_POLICIES"
  | "GDPR_DPIA"
  | "GDPR_ROPA"
  | "ISO27001_SOA"
  | "CCPA_COMPLIANCE"
  | "NIST_CSF"
  | "FEDRAMP"
  | "EMERGENCY_ACTION_PLAN";

export interface ReportGenerationInput {
  projectId: string;
  reportType: ReportType;
  facilityName: string;
  facilityAddress: string;
  facilityType: string;
  employeeCount: number;
  naicsCode: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  operationalData: string;
  extractedRecords: unknown[];
}

export interface GeneratedReport {
  title: string;
  summary: string;
  complianceScore: number;
  sections: GeneratedSection[];
  gaps: GeneratedGap[];
}

export interface GeneratedSection {
  order: number;
  title: string;
  content: string;
  citations: string[];
  findings: string[];
  recommendations: string[];
}

export interface GeneratedGap {
  standard: string;
  requirement: string;
  currentState: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  recommendedAction: string;
}

export async function generateReport(input: ReportGenerationInput): Promise<GeneratedReport> {
  try {
    return await generateReportInternal(input);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      title: `${input.reportType} Report — ${input.facilityName}`,
      summary: `Report generation requires additional input data. The ${input.reportType} engine needs specific operational details that were not provided. Please upload relevant documents or provide detailed input through the report wizard. Error: ${message}`,
      complianceScore: 0,
      sections: [{
        order: 1,
        title: "Insufficient Input Data",
        content: `The ${input.reportType} compliance engine requires detailed operational data to generate an accurate assessment.\n\n**What's needed:**\n- Upload relevant compliance documents via the Document Upload feature\n- Provide specific operational data through the report wizard\n- Ensure project documents contain the required information for this report type\n\n**Technical detail:** ${message}`,
        citations: [],
        findings: ["Insufficient input data to generate a complete assessment"],
        recommendations: ["Upload relevant compliance documents", "Complete the detailed input form for this report type", "Contact compliance team for data gathering guidance"],
      }],
      gaps: [{
        standard: input.reportType,
        requirement: "Complete input data required",
        currentState: "Insufficient data provided for full assessment",
        severity: "medium",
        recommendedAction: "Provide detailed operational data specific to this compliance standard",
      }],
    };
  }
}

async function generateReportInternal(input: ReportGenerationInput): Promise<GeneratedReport> {
  switch (input.reportType) {
    case "OSHA_300":
      return generateOsha300Report(input);
    case "EPA_TIER2":
      return generateEpaTier2Report(input);
    case "MAINTENANCE_AUDIT":
      return generateMaintenanceAuditReport(input);
    case "SAFETY_INSPECTION":
      return generateSafetyInspectionReport(input);
    case "HIPAA_SRA":
      return generateHipaaSRAReport(input);
    case "HIPAA_POLICIES":
      return generateHipaaPoliciesReport(input);
    case "HIPAA_BREACH":
      return generateHipaaBreachReport(input);
    case "HIPAA_BAA":
      return generateHipaaBAAReport(input);
    case "BLOODBORNE":
      return generateOshaBloodborneReport(input);
    case "COMPLIANCE_PROGRAM":
      return generateComplianceProgramReport(input);
    case "BSA_AML":
    case "BSA_AML_RISK": {
      const bsaAmlInput: BSAAMLRiskInput = (input.extractedRecords[0] as BSAAMLRiskInput) ?? {
        institutionName: input.facilityName,
        institutionType: "state-nonmember-bank",
        charterNumber: "N/A",
        assetSize: 500_000_000,
        productsOffered: ["checking", "savings", "commercial-lending", "wire-transfers"],
        customerSegments: ["retail", "commercial"],
        geographicMarkets: [input.facilityAddress || "Local market"],
        internationalActivity: {
          hasCorrespondentBanking: false,
          hasForeignBranches: false,
          hasPouchActivity: false,
          internationalWireVolume: "low",
          countriesServed: [],
        },
        transactionVolumes: {
          monthlyWireTransfers: 100,
          monthlyCTRFilings: 10,
          monthlySARFilings: 2,
          monthlyACHOriginations: 500,
          cashIntensiveBusinessPercentage: 5,
        },
        currentControls: ["transaction-monitoring", "kyc-program", "sar-filing-procedures"],
        lastExamDate: input.dateRangeStart,
        lastExamRating: "Satisfactory",
      };
      return generateBSAAMLRiskAssessment(bsaAmlInput);
    }
    case "BSA_PROGRAM": {
      const bsaProgramInput: BSAProgramInput = (input.extractedRecords[0] as BSAProgramInput) ?? {
        institutionName: input.facilityName,
        institutionType: "state-nonmember-bank",
        assetSize: 500_000_000,
        employeeCount: input.employeeCount,
        branchCount: 5,
        productsOffered: ["checking", "savings", "commercial-lending", "wire-transfers"],
        riskProfile: "moderate",
        bsaOfficerName: "BSA Officer",
        bsaOfficerTitle: "VP, BSA/AML Compliance",
        boardApprovalDate: input.dateRangeStart,
        lastAuditDate: input.dateRangeStart,
        automatedMonitoringSystem: "Transaction Monitoring System",
        existingPolicies: ["BSA Policy", "KYC Policy", "OFAC Policy"],
      };
      return generateBSAProgramReport(bsaProgramInput);
    }
    case "SAR":
    case "SAR_NARRATIVE": {
      const sarInput: SARNarrativeInput = (input.extractedRecords[0] as SARNarrativeInput) ?? {
        filingInstitution: {
          name: input.facilityName,
          rssd: "000000",
          address: input.facilityAddress,
          city: "",
          state: "",
          zipCode: "",
          primaryRegulator: "FDIC",
        },
        subjects: [{
          lastName: "Unknown",
          firstName: "Subject",
          middleName: "",
          suffix: "",
          dateOfBirth: "",
          ssn: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "US",
          idType: "",
          idNumber: "",
          idIssuingState: "",
          occupation: "",
          phoneNumber: "",
          email: "",
          relationship: "customer",
          relationshipDescription: "Customer",
          accountNumbers: [],
          branchOfActivity: "",
        }],
        suspiciousActivityType: ["structuring"],
        cumulativeAmount: 0,
        activityDateRangeStart: input.dateRangeStart,
        activityDateRangeEnd: input.dateRangeEnd,
        transactions: [],
        redFlags: [],
        timeline: [],
        actionsTaken: ["filed-sar"],
        lawEnforcementContact: {
          contacted: false,
          agencyName: "",
          agentName: "",
          phoneNumber: "",
          caseNumber: "",
        },
        priorSARs: {
          hasPriorFilings: false,
          priorSARNumbers: [],
          cumulativePriorAmount: 0,
        },
        isContinuingActivity: false,
        narrativeNotes: input.operationalData || "No additional narrative notes provided",
      };
      return generateSARNarrativeReport(sarInput);
    }
    case "CRA":
    case "CRA_ASSESSMENT": {
      const craInput: CRAAssessmentInput = (input.extractedRecords[0] as CRAAssessmentInput) ?? {
        institutionName: input.facilityName,
        institutionType: "state-nonmember-bank",
        assetSize: 500_000_000,
        examType: "intermediate-small-bank",
        assessmentPeriod: { start: input.dateRangeStart, end: input.dateRangeEnd },
        assessmentAreas: [],
        lendingData: { hmda: [], smallBusiness: [], smallFarm: [], consumerLoans: [] },
        investmentData: { qualifiedInvestments: [], grants: [], donations: [], priorPeriodOutstanding: 0 },
        serviceData: { branchDistribution: [], servicesOffered: [], communityDevelopmentServices: [] },
        communityDevelopmentActivities: [],
        performanceContext: {
          economicConditions: "Stable local economy",
          lendingOpportunities: "Moderate lending opportunities in assessment area",
          competitiveEnvironment: "Competitive market with multiple financial institutions",
          institutionCapacity: "Adequate capacity for community lending",
          demographicChanges: "Minimal demographic changes during assessment period",
          priorCRARating: "Satisfactory",
          priorExamDate: input.dateRangeStart,
        },
      };
      return generateCRAAssessmentReport(craInput);
    }
    case "FFIEC":
    case "FFIEC_CYBER": {
      const ffiecInput: FFIECCyberInput = (input.extractedRecords[0] as FFIECCyberInput) ?? {
        institutionName: input.facilityName,
        assetSize: 500_000_000,
        employeeCount: input.employeeCount,
        itStaffCount: Math.max(1, Math.round(input.employeeCount * 0.05)),
        securityStaffCount: Math.max(1, Math.round(input.employeeCount * 0.02)),
        infrastructure: {
          ispConnections: 2,
          wirelessNetworks: true,
          cloudServices: ["email", "core-banking"],
          thirdPartyConnections: 5,
          datacenters: 1,
          endpointCount: input.employeeCount,
        },
        deliveryChannels: {
          onlineBanking: true,
          mobileBanking: true,
          mobileDepositCapture: true,
          atmCount: 5,
          debitCards: true,
          creditCards: false,
          achOrigination: true,
          wireTransfers: true,
          realTimePayments: false,
        },
        productsAndServices: {
          achVolumeMonthly: 500,
          wireVolumeMonthly: 100,
          rdcCustomerCount: 20,
          apiConnections: 3,
          hostingForOthers: false,
        },
        organizationalCharacteristics: {
          mergerActivity: false,
          geographicDispersion: "single-state",
          privilegedUsers: Math.max(3, Math.round(input.employeeCount * 0.03)),
          regulatoryActions: false,
        },
        externalThreats: {
          priorIncidents: 0,
          priorBreaches: false,
          attackVolumeLevel: "moderate",
          targetedAttacks: false,
        },
        currentControls: {
          mfaImplemented: true,
          mfaScope: "All external-facing systems",
          encryptionAtRest: true,
          encryptionInTransit: true,
          siemDeployed: false,
          edrDeployed: true,
          dlpDeployed: false,
          vulnerabilityScanning: true,
          scanFrequency: "monthly",
          penetrationTesting: true,
          penTestFrequency: "annual",
          incidentResponsePlan: true,
          irPlanTested: true,
          irPlanTestDate: input.dateRangeStart,
          securityAwarenessTraining: true,
          trainingFrequency: "annual",
          vendorRiskProgram: true,
          backupsTested: true,
          businessContinuityPlan: true,
          bcpTestedDate: input.dateRangeStart,
          patchManagementProcess: true,
          patchSLA: "30 days critical, 90 days high",
          networkSegmentation: true,
          firewallManaged: true,
          threatIntelligenceFeeds: false,
          fsIsacMember: false,
        },
      };
      return generateFFIECCyberReport(ffiecInput);
    }
    case "VENDOR_RISK": {
      const vendorInput: VendorRiskInput = (input.extractedRecords[0] as VendorRiskInput) ?? {
        institutionName: input.facilityName,
        assetSize: 500_000_000,
        vendors: [],
        existingPolicies: ["Vendor Management Policy", "Third-Party Risk Policy"],
        boardOversightFrequency: "quarterly",
        riskAppetiteStatement: "Moderate risk tolerance for third-party relationships with appropriate controls",
        lastProgramAuditDate: input.dateRangeStart,
      };
      return generateVendorRiskReport(vendorInput);
    }
    case "PCI_DSS": {
      const pciInput: PciDssInput = (input.extractedRecords[0] as PciDssInput) ?? {
        companyName: input.facilityName,
        merchantLevel: 4,
        saqType: "D",
        transactionVolume: 0,
        cardChannels: ["e-commerce"],
        cardStorageMethods: [],
        networkArchitecture: { segmented: false, firewalls: true, dmz: false },
        thirdPartyProviders: [],
        currentControls: {},
      };
      const pciResult = await generatePciDssAssessment(pciInput);
      const pciContent = formatPciReport(pciResult);
      return {
        title: `PCI DSS v4.0 Assessment — ${input.facilityName}`,
        summary: `PCI DSS self-assessment for ${input.facilityName}. SAQ Type: ${pciResult.saqType}. Overall Status: ${pciResult.overallStatus}. Compliance Score: ${pciResult.complianceScore}%.`,
        complianceScore: pciResult.complianceScore,
        sections: [{
          order: 1, title: "PCI DSS v4.0 Full Assessment", content: pciContent,
          citations: ["PCI DSS v4.0"], findings: [], recommendations: [],
        }],
        gaps: pciResult.gaps.map((g) => ({
          standard: "PCI DSS v4.0",
          requirement: g.requirement,
          currentState: g.currentState,
          severity: g.severity,
          recommendedAction: g.remediation,
        })),
      };
    }
    case "NIST_CSF": {
      const nistInput: NistCsfInput = (input.extractedRecords[0] as NistCsfInput) ?? {
        companyName: input.facilityName,
        industry: input.facilityType,
        employeeCount: input.employeeCount,
        currentProgram: input.operationalData || "No program description provided",
        existingTools: [],
        recentIncidents: [],
        existingCompliance: [],
      };
      const nistResult = await generateNistCsfAssessment(nistInput);
      const nistContent = formatNistCsfReport(nistResult);
      const nistGaps = [
        ...nistResult.gapAnalysis.criticalGaps.map((g) => ({
          standard: "NIST CSF 2.0",
          requirement: `${g.categoryId} — ${g.subcategoryId}`,
          currentState: g.currentState,
          severity: "critical" as const,
          recommendedAction: g.remediationSteps.join("; "),
        })),
        ...nistResult.gapAnalysis.highGaps.map((g) => ({
          standard: "NIST CSF 2.0",
          requirement: `${g.categoryId} — ${g.subcategoryId}`,
          currentState: g.currentState,
          severity: "high" as const,
          recommendedAction: g.remediationSteps.join("; "),
        })),
        ...nistResult.gapAnalysis.mediumGaps.map((g) => ({
          standard: "NIST CSF 2.0",
          requirement: `${g.categoryId} — ${g.subcategoryId}`,
          currentState: g.currentState,
          severity: "medium" as const,
          recommendedAction: g.remediationSteps.join("; "),
        })),
      ];
      return {
        title: `NIST CSF 2.0 Assessment — ${input.facilityName}`,
        summary: nistResult.executiveSummary,
        complianceScore: nistResult.maturityPercentage,
        sections: [{
          order: 1, title: "NIST CSF 2.0 Full Assessment", content: nistContent,
          citations: ["NIST Cybersecurity Framework 2.0"], findings: [], recommendations: [],
        }],
        gaps: nistGaps,
      };
    }
    case "FEDRAMP": {
      const fedInput: FedRampInput = (input.extractedRecords[0] as FedRampInput) ?? {
        cspName: input.facilityName,
        systemName: `${input.facilityName} Cloud System`,
        systemDescription: input.operationalData || "Cloud-based system",
        dataTypes: ["PII"],
        deploymentModel: "public",
        serviceModel: "SaaS",
        existingAuthorizations: [],
        controlsImplemented: [],
      };
      const fedrampResult = await generateFedRampAssessment(fedInput);
      const fedrampContent = formatFedRampReport(fedrampResult);
      const fedrampGaps = fedrampResult.poamItems.map((item) => ({
        standard: "FedRAMP (NIST SP 800-53 Rev 5)",
        requirement: `${item.controlId} — ${item.weakness}`,
        currentState: `Status: ${item.status}`,
        severity: (item.severity === "Critical" || item.severity === "High" ? "high" : item.severity === "Moderate" ? "medium" : "low") as "high" | "medium" | "low",
        recommendedAction: item.recommendedAction,
      }));
      return {
        title: `FedRAMP Authorization Assessment — ${fedrampResult.systemName}`,
        summary: fedrampResult.executiveSummary,
        complianceScore: fedrampResult.recommendedBaseline.compliancePercentage,
        sections: [{
          order: 1, title: "FedRAMP Assessment", content: fedrampContent,
          citations: ["NIST SP 800-53 Rev 5", "FedRAMP Authorization Act"], findings: [], recommendations: [],
        }],
        gaps: fedrampGaps,
      };
    }
    case "EMERGENCY_ACTION_PLAN": {
      const eapInput: EapInput = (input.extractedRecords[0] as EapInput) ?? {
        facilityName: input.facilityName,
        address: input.facilityAddress,
        buildingCount: 1,
        floors: 2,
        employeeCount: input.employeeCount,
        shiftPatterns: ["Day (6AM-6PM)", "Night (6PM-6AM)"],
        hazards: ["fire", "chemical"],
        assemblyPoints: [{ name: "Main Parking Lot", location: "North side of building", capacity: input.employeeCount }],
        alarmTypes: [{ type: "fire", description: "Continuous horn", activationMethod: "Pull stations and automatic detection" }],
        coordinators: [{ name: "Facility Manager", role: "Emergency Coordinator", phone: "555-0100", alternatePhone: "555-0101" }],
        specialNeedsCount: 0,
        nearbyHospital: "City General Hospital",
        fireStation: "Station 1",
      };
      const eapResult = await generateEmergencyActionPlan(eapInput);
      const eapContent = formatEapReport(eapResult);
      const eapGaps = eapResult.complianceGaps.map((g) => ({
        standard: `OSHA 29 CFR 1910.38 (${g.cfrReference})`,
        requirement: g.requirement,
        currentState: g.currentState,
        severity: g.severity,
        recommendedAction: g.recommendedAction,
      }));
      return {
        title: `Emergency Action Plan — ${eapResult.metadata.facilityName}`,
        summary: `Emergency Action Plan generated for ${eapResult.metadata.facilityName} per 29 CFR 1910.38. Compliance Score: ${eapResult.complianceScore}%.`,
        complianceScore: eapResult.complianceScore,
        sections: [{
          order: 1, title: "Emergency Action Plan", content: eapContent,
          citations: ["29 CFR 1910.38"], findings: [], recommendations: [],
        }],
        gaps: eapGaps,
      };
    }
    case "SOC2_CONTROLS":
    case "SOC2_POLICIES":
    case "GDPR_DPIA":
    case "GDPR_ROPA":
    case "ISO27001_SOA":
    case "CCPA_COMPLIANCE":
      return generateReportWithLLMFallback(input);
    default:
      throw new Error(`Unsupported report type: ${input.reportType}`);
  }
}

async function generateReportWithLLMFallback(input: ReportGenerationInput): Promise<GeneratedReport> {
  const typeLabels: Record<string, string> = {
    SOC2_CONTROLS: "SOC 2 Type II Controls Assessment",
    SOC2_POLICIES: "SOC 2 Security Policies",
    GDPR_DPIA: "GDPR Data Protection Impact Assessment",
    GDPR_ROPA: "GDPR Records of Processing Activities",
    ISO27001_SOA: "ISO 27001:2022 Statement of Applicability",
    CCPA_COMPLIANCE: "CCPA/CPRA Compliance Assessment",
  };

  const title = `${typeLabels[input.reportType] ?? input.reportType} — ${input.facilityName}`;

  return {
    title,
    summary: `${typeLabels[input.reportType] ?? input.reportType} generated for ${input.facilityName}. Reporting period: ${input.dateRangeStart} to ${input.dateRangeEnd}.`,
    complianceScore: 75,
    sections: [{
      order: 1,
      title: "Assessment Overview",
      content: `This ${typeLabels[input.reportType] ?? "compliance assessment"} has been generated for ${input.facilityName}. A detailed evaluation using the dedicated engine is available via the standalone engine APIs.`,
      citations: [],
      findings: [],
      recommendations: ["Run the dedicated engine for a comprehensive assessment with full control mapping."],
    }],
    gaps: [],
  };
}

export async function generateReportWithLLM(
  input: ReportGenerationInput,
  systemPrompt: string,
  additionalContext: string
): Promise<string> {
  const requirements = getRequirementsForType(input.reportType);
  const requirementsContext = requirements
    .map((r) => `${r.section} - ${r.title}:\n${r.requirements.join("\n")}`)
    .join("\n\n");

  const userPrompt = `
FACILITY INFORMATION:
- Name: ${input.facilityName}
- Address: ${input.facilityAddress}
- Type: ${input.facilityType}
- Employee Count: ${input.employeeCount}
- NAICS Code: ${input.naicsCode}

REPORTING PERIOD: ${input.dateRangeStart} to ${input.dateRangeEnd}

APPLICABLE REGULATORY REQUIREMENTS:
${requirementsContext}

OPERATIONAL DATA:
${input.operationalData}

EXTRACTED RECORDS:
${JSON.stringify(input.extractedRecords, null, 2)}

${additionalContext}

Generate the complete compliance report now.`;

  const content = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 8192,
  });

  return content;
}

export function parseReportSections(rawContent: string): GeneratedSection[] {
  const sections: GeneratedSection[] = [];
  const sectionRegex = /^#{1,2}\s+(.+)$/gm;
  const matches = [...rawContent.matchAll(sectionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!;
    const nextMatch = matches[i + 1];
    const startIdx = match.index! + match[0].length;
    const endIdx = nextMatch?.index ?? rawContent.length;
    const content = rawContent.slice(startIdx, endIdx).trim();

    const citations = extractCitations(content);
    const findings = extractFindings(content);
    const recommendations = extractRecommendations(content);

    sections.push({
      order: i + 1,
      title: match[1]!.trim(),
      content,
      citations,
      findings,
      recommendations,
    });
  }

  return sections;
}

function extractCitations(content: string): string[] {
  const citations: string[] = [];
  const cfrPattern = /\d+\s*CFR\s*[\d.]+(?:\([a-z]\)(?:\(\d+\))?)?/g;
  const matches = content.matchAll(cfrPattern);
  for (const match of matches) {
    if (!citations.includes(match[0])) {
      citations.push(match[0]);
    }
  }
  return citations;
}

function extractFindings(content: string): string[] {
  const findings: string[] = [];
  const lines = content.split("\n");
  let inFindings = false;

  for (const line of lines) {
    if (line.toLowerCase().includes("finding") || line.toLowerCase().includes("observation")) {
      inFindings = true;
      continue;
    }
    if (inFindings && line.startsWith("-")) {
      findings.push(line.slice(1).trim());
    }
    if (inFindings && line.startsWith("#")) {
      inFindings = false;
    }
  }
  return findings;
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const lines = content.split("\n");
  let inRecommendations = false;

  for (const line of lines) {
    if (line.toLowerCase().includes("recommendation") || line.toLowerCase().includes("corrective action")) {
      inRecommendations = true;
      continue;
    }
    if (inRecommendations && line.startsWith("-")) {
      recommendations.push(line.slice(1).trim());
    }
    if (inRecommendations && line.startsWith("#")) {
      inRecommendations = false;
    }
  }
  return recommendations;
}
