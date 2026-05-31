/**
 * NIST Cybersecurity Framework 2.0 Assessment Engine
 *
 * Generates comprehensive organizational assessments against the NIST CSF 2.0
 * framework (published February 26, 2024). Covers all six core functions:
 * Govern (GV), Identify (ID), Protect (PR), Detect (DE), Respond (RS), Recover (RC).
 *
 * References:
 * - NIST CSF 2.0: https://doi.org/10.6028/NIST.CSWP.29
 * - NIST SP 800-53 Rev. 5 (control mapping)
 * - NIST SP 800-55 Rev. 2 (measurement guide)
 */

import { generateCompletion } from "../../lib/llm.js";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type CsfFunction = "GV" | "ID" | "PR" | "DE" | "RS" | "RC";

export type ImplementationTier = 1 | 2 | 3 | 4;

export type TierLabel = "Partial" | "Risk Informed" | "Repeatable" | "Adaptive";

export interface NistCsfInput {
  companyName: string;
  industry: string;
  employeeCount: number;
  currentProgram: string;
  existingTools: string[];
  recentIncidents: IncidentRecord[];
  existingCompliance: string[];
  targetTier?: ImplementationTier;
  criticalAssets?: string[];
  regulatoryRequirements?: string[];
}

export interface IncidentRecord {
  description: string;
  date: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  resolved: boolean;
  lessonsLearned?: string;
}

export interface NistCsfAssessment {
  companyName: string;
  industry: string;
  assessmentDate: string;
  frameworkVersion: "2.0";
  overallTier: TierAssessment;
  functionScores: FunctionScore[];
  gapAnalysis: GapAnalysisResult;
  prioritizedActions: PrioritizedAction[];
  executiveSummary: string;
  riskScore: number;
  maturityPercentage: number;
  regulatoryContext: RegulatoryContext;
}

export interface TierAssessment {
  currentTier: ImplementationTier;
  currentTierLabel: TierLabel;
  targetTier: ImplementationTier;
  targetTierLabel: TierLabel;
  tierJustification: string;
  tierByFunction: Record<CsfFunction, ImplementationTier>;
  riskManagementProcessScore: number;
  integratedRiskManagementScore: number;
  externalParticipationScore: number;
}

export interface FunctionScore {
  functionId: CsfFunction;
  functionName: string;
  score: number;
  maxScore: number;
  percentage: number;
  categories: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  implementationTier: ImplementationTier;
}

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  subcategories: SubcategoryAssessment[];
  score: number;
  maxScore: number;
  percentage: number;
  maturityLevel: "Not Implemented" | "Partially Implemented" | "Largely Implemented" | "Fully Implemented";
}

export interface SubcategoryAssessment {
  subcategoryId: string;
  description: string;
  currentState: "Not Implemented" | "Partially Implemented" | "Largely Implemented" | "Fully Implemented";
  score: number;
  evidence: string[];
  gaps: string[];
  sp80053Mapping: string[];
}

export interface GapAnalysisResult {
  totalGaps: number;
  criticalGaps: GapItem[];
  highGaps: GapItem[];
  mediumGaps: GapItem[];
  lowGaps: GapItem[];
  currentProfileSummary: ProfileSummary;
  targetProfileSummary: ProfileSummary;
  gapsByFunction: Record<CsfFunction, number>;
}

export interface GapItem {
  id: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  currentState: string;
  targetState: string;
  impact: "Critical" | "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High" | "Very High";
  estimatedTimelineWeeks: number;
  remediationSteps: string[];
  regulatoryImplication: string;
}

export interface ProfileSummary {
  tier: ImplementationTier;
  totalSubcategories: number;
  implemented: number;
  partiallyImplemented: number;
  notImplemented: number;
  coveragePercentage: number;
}

export interface PrioritizedAction {
  priority: number;
  actionId: string;
  title: string;
  description: string;
  csfReference: string;
  category: CsfFunction;
  effort: "Low" | "Medium" | "High" | "Very High";
  impact: "Critical" | "High" | "Medium" | "Low";
  estimatedCost: CostEstimate;
  estimatedTimelineWeeks: number;
  dependencies: string[];
  quickWin: boolean;
  regulatoryDriver: string;
}

export interface CostEstimate {
  range: string;
  category: "Minimal" | "Low" | "Moderate" | "Significant" | "Major";
}

export interface RegulatoryContext {
  applicableFrameworks: string[];
  crossMappings: CrossMapping[];
  industrySpecificRequirements: string[];
}

export interface CrossMapping {
  nistCsfCategory: string;
  mappedFramework: string;
  mappedControl: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants — NIST CSF 2.0 Taxonomy
// ─────────────────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<ImplementationTier, TierLabel> = {
  1: "Partial",
  2: "Risk Informed",
  3: "Repeatable",
  4: "Adaptive",
};

const CSF_FUNCTION_NAMES: Record<CsfFunction, string> = {
  GV: "Govern",
  ID: "Identify",
  PR: "Protect",
  DE: "Detect",
  RS: "Respond",
  RC: "Recover",
};

interface CategoryDefinition {
  id: string;
  name: string;
  function: CsfFunction;
  subcategories: SubcategoryDefinition[];
}

interface SubcategoryDefinition {
  id: string;
  description: string;
  sp80053Mappings: string[];
}

const CSF_CATEGORIES: CategoryDefinition[] = [
  // ── GOVERN (GV) ──────────────────────────────────────────────────────────
  {
    id: "GV.OC",
    name: "Organizational Context",
    function: "GV",
    subcategories: [
      { id: "GV.OC-01", description: "The organizational mission is understood and informs cybersecurity risk management", sp80053Mappings: ["PM-7", "PM-11"] },
      { id: "GV.OC-02", description: "Internal and external stakeholders are understood, and their needs and expectations regarding cybersecurity risk management are understood and considered", sp80053Mappings: ["PM-7", "PM-25"] },
      { id: "GV.OC-03", description: "Legal, regulatory, and contractual requirements regarding cybersecurity — including privacy and civil liberties obligations — are understood and managed", sp80053Mappings: ["PM-7", "PM-11", "SA-2"] },
      { id: "GV.OC-04", description: "Critical objectives, capabilities, and services that external stakeholders depend on or expect are understood and communicated", sp80053Mappings: ["PM-7", "PM-11", "CP-2"] },
      { id: "GV.OC-05", description: "Outcomes, capabilities, and services that the organization depends on are understood and communicated", sp80053Mappings: ["PM-7", "SA-9", "SR-1"] },
    ],
  },
  {
    id: "GV.RM",
    name: "Risk Management Strategy",
    function: "GV",
    subcategories: [
      { id: "GV.RM-01", description: "Risk management objectives are established and agreed to by organizational stakeholders", sp80053Mappings: ["PM-9", "PM-28"] },
      { id: "GV.RM-02", description: "Risk appetite and risk tolerance statements are established, communicated, and maintained", sp80053Mappings: ["PM-9", "RA-1"] },
      { id: "GV.RM-03", description: "Cybersecurity risk management activities and outcomes are included in enterprise risk management processes", sp80053Mappings: ["PM-9", "PM-28", "PM-30"] },
      { id: "GV.RM-04", description: "Strategic direction that describes appropriate risk response options is established and communicated", sp80053Mappings: ["PM-9", "RA-3"] },
      { id: "GV.RM-05", description: "Lines of communication across the organization are established for cybersecurity risks, including risks from suppliers and other third parties", sp80053Mappings: ["PM-9", "PM-30", "SR-1"] },
      { id: "GV.RM-06", description: "A standardized method for calculating, documenting, categorizing, and prioritizing cybersecurity risks is established and communicated", sp80053Mappings: ["PM-9", "RA-1", "RA-3"] },
      { id: "GV.RM-07", description: "Strategic opportunities (i.e., positive risks) are characterized and are included in organizational cybersecurity risk discussions", sp80053Mappings: ["PM-9"] },
    ],
  },
  {
    id: "GV.RR",
    name: "Roles, Responsibilities, and Authorities",
    function: "GV",
    subcategories: [
      { id: "GV.RR-01", description: "Organizational leadership is responsible and accountable for cybersecurity risk and fosters a culture that is risk-aware, ethical, and continually improving", sp80053Mappings: ["PM-1", "PM-2"] },
      { id: "GV.RR-02", description: "Roles, responsibilities, and authorities related to cybersecurity risk management are established, communicated, understood, and enforced", sp80053Mappings: ["PM-1", "PM-2", "PS-7"] },
      { id: "GV.RR-03", description: "Adequate resources are allocated commensurate with the cybersecurity risk strategy, roles, responsibilities, and policies", sp80053Mappings: ["PM-3", "SA-2"] },
      { id: "GV.RR-04", description: "Cybersecurity is included in human resources practices", sp80053Mappings: ["PS-1", "PS-2", "PS-3", "PS-4", "PS-5"] },
    ],
  },
  {
    id: "GV.PO",
    name: "Policy",
    function: "GV",
    subcategories: [
      { id: "GV.PO-01", description: "Policy for managing cybersecurity risks is established based on organizational context, cybersecurity strategy, and priorities and is communicated and enforced", sp80053Mappings: ["PM-1", "PL-1"] },
      { id: "GV.PO-02", description: "Policy for managing cybersecurity risks is reviewed, updated, communicated, and enforced to reflect changes in requirements, threats, technology, and organizational mission", sp80053Mappings: ["PM-1", "PL-1", "PL-2"] },
    ],
  },
  {
    id: "GV.SC",
    name: "Cybersecurity Supply Chain Risk Management",
    function: "GV",
    subcategories: [
      { id: "GV.SC-01", description: "A cybersecurity supply chain risk management program, strategy, objectives, policies, and processes are established and agreed to by organizational stakeholders", sp80053Mappings: ["SR-1", "SR-2", "SR-3"] },
      { id: "GV.SC-02", description: "Cybersecurity roles and responsibilities for suppliers, customers, and partners are established, communicated, and coordinated internally and externally", sp80053Mappings: ["SR-1", "SR-2", "SA-9"] },
      { id: "GV.SC-03", description: "Cybersecurity supply chain risk management is integrated into cybersecurity and enterprise risk management, risk assessment, and improvement processes", sp80053Mappings: ["SR-1", "SR-3", "RA-3"] },
      { id: "GV.SC-04", description: "Suppliers are known and prioritized by criticality", sp80053Mappings: ["SR-2", "SR-6"] },
      { id: "GV.SC-05", description: "Requirements to address cybersecurity risks in supply chains are established, prioritized, and integrated into contracts and other types of agreements with suppliers and other relevant third parties", sp80053Mappings: ["SR-2", "SR-3", "SA-4"] },
      { id: "GV.SC-06", description: "Planning and due diligence are conducted to reduce risks before entering into formal supplier or other third-party relationships", sp80053Mappings: ["SR-5", "SR-6", "SA-9"] },
      { id: "GV.SC-07", description: "The risks posed by a supplier, their products and services, and other third parties are understood, recorded, prioritized, assessed, responded to, and monitored over the course of the relationship", sp80053Mappings: ["SR-5", "SR-6", "RA-3"] },
      { id: "GV.SC-08", description: "Relevant suppliers and other third parties are included in incident planning, response, and recovery activities", sp80053Mappings: ["SR-8", "IR-4", "CP-2"] },
      { id: "GV.SC-09", description: "Supply chain security practices are integrated into cybersecurity and enterprise risk management programs, and their performance is monitored throughout the technology product and service life cycle", sp80053Mappings: ["SR-1", "SR-11"] },
      { id: "GV.SC-10", description: "Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement", sp80053Mappings: ["SR-2", "SA-9"] },
    ],
  },
  // ── IDENTIFY (ID) ────────────────────────────────────────────────────────
  {
    id: "ID.AM",
    name: "Asset Management",
    function: "ID",
    subcategories: [
      { id: "ID.AM-01", description: "Inventories of hardware managed by the organization are maintained", sp80053Mappings: ["CM-8", "PM-5"] },
      { id: "ID.AM-02", description: "Inventories of software, services, and systems managed by the organization are maintained", sp80053Mappings: ["CM-8", "PM-5"] },
      { id: "ID.AM-03", description: "Representations of the organization's authorized network communication and internal and external network data flows are maintained", sp80053Mappings: ["AC-4", "CA-3", "PL-2"] },
      { id: "ID.AM-04", description: "Inventories of services provided by suppliers are maintained", sp80053Mappings: ["PM-5", "SR-2", "SA-9"] },
      { id: "ID.AM-05", description: "Assets are prioritized based on classification, criticality, resources, and impact to the mission", sp80053Mappings: ["RA-2", "SC-6", "PM-11"] },
      { id: "ID.AM-07", description: "Inventories of data and corresponding metadata for designated data types are maintained", sp80053Mappings: ["CM-8", "PM-5", "MP-4"] },
      { id: "ID.AM-08", description: "Systems, hardware, software, services, and data are managed throughout their life cycles", sp80053Mappings: ["CM-8", "SA-22", "PL-2"] },
    ],
  },
  {
    id: "ID.RA",
    name: "Risk Assessment",
    function: "ID",
    subcategories: [
      { id: "ID.RA-01", description: "Vulnerabilities in assets are identified, validated, and recorded", sp80053Mappings: ["CA-2", "CA-8", "RA-5", "SI-5"] },
      { id: "ID.RA-02", description: "Cyber threat intelligence is received from information sharing forums and sources", sp80053Mappings: ["PM-16", "SI-5", "SR-8"] },
      { id: "ID.RA-03", description: "Internal and external threats to the organization are identified and recorded", sp80053Mappings: ["RA-3", "SI-5", "PM-12"] },
      { id: "ID.RA-04", description: "Potential impacts and likelihoods of threats exploiting vulnerabilities are identified and recorded", sp80053Mappings: ["RA-3", "RA-5"] },
      { id: "ID.RA-05", description: "Threats, vulnerabilities, likelihoods, and impacts are used to understand inherent risk and inform risk response prioritization", sp80053Mappings: ["RA-3", "PM-9"] },
      { id: "ID.RA-06", description: "Risk responses are chosen, prioritized, planned, tracked, and communicated", sp80053Mappings: ["RA-7", "PM-9", "PM-4"] },
      { id: "ID.RA-07", description: "Changes and exceptions are managed, assessed for risk impact, recorded, and tracked", sp80053Mappings: ["CA-7", "CM-3", "CM-4"] },
      { id: "ID.RA-08", description: "Processes for receiving, analyzing, and responding to vulnerability disclosures are established", sp80053Mappings: ["RA-5", "SI-5", "PM-15"] },
      { id: "ID.RA-09", description: "The authenticity and integrity of hardware and software are assessed prior to acquisition and use", sp80053Mappings: ["SR-4", "SR-9", "SR-10", "SA-12"] },
      { id: "ID.RA-10", description: "Critical suppliers are assessed prior to acquisition", sp80053Mappings: ["SR-5", "SR-6"] },
    ],
  },
  {
    id: "ID.IM",
    name: "Improvement",
    function: "ID",
    subcategories: [
      { id: "ID.IM-01", description: "Improvements are identified from evaluations", sp80053Mappings: ["CA-2", "CA-7", "PM-4"] },
      { id: "ID.IM-02", description: "Improvements are identified from security tests and exercises, including those done in coordination with suppliers and relevant third parties", sp80053Mappings: ["CA-2", "CA-8", "CP-4", "IR-3"] },
      { id: "ID.IM-03", description: "Improvements are identified from execution of operational processes, procedures, and activities", sp80053Mappings: ["CA-2", "CA-7", "PL-2"] },
      { id: "ID.IM-04", description: "Incident response plans and other cybersecurity plans that affect operations are established, communicated, maintained, and improved", sp80053Mappings: ["IR-1", "IR-8", "CP-2"] },
    ],
  },
  // ── PROTECT (PR) ─────────────────────────────────────────────────────────
  {
    id: "PR.AA",
    name: "Identity Management, Authentication, and Access Control",
    function: "PR",
    subcategories: [
      { id: "PR.AA-01", description: "Identities and credentials for authorized users, services, and hardware are managed by the organization", sp80053Mappings: ["IA-1", "IA-2", "IA-3", "IA-4", "IA-5", "IA-8"] },
      { id: "PR.AA-02", description: "Identities are proofed and bound to credentials based on the context of interactions", sp80053Mappings: ["IA-5", "IA-12"] },
      { id: "PR.AA-03", description: "Users, services, and hardware are authenticated", sp80053Mappings: ["IA-2", "IA-3", "IA-8", "IA-11"] },
      { id: "PR.AA-04", description: "Identity assertions are protected, conveyed, and verified", sp80053Mappings: ["IA-2", "IA-5", "SC-23"] },
      { id: "PR.AA-05", description: "Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties", sp80053Mappings: ["AC-1", "AC-2", "AC-3", "AC-5", "AC-6", "AC-24"] },
      { id: "PR.AA-06", description: "Physical access to assets is managed, monitored, and enforced commensurate with risk", sp80053Mappings: ["PE-1", "PE-2", "PE-3", "PE-4", "PE-5", "PE-6"] },
    ],
  },
  {
    id: "PR.AT",
    name: "Awareness and Training",
    function: "PR",
    subcategories: [
      { id: "PR.AT-01", description: "Personnel are provided with awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind", sp80053Mappings: ["AT-1", "AT-2", "AT-3"] },
      { id: "PR.AT-02", description: "Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant tasks with cybersecurity risks in mind", sp80053Mappings: ["AT-3", "CP-3", "IR-2", "SA-16"] },
    ],
  },
  {
    id: "PR.DS",
    name: "Data Security",
    function: "PR",
    subcategories: [
      { id: "PR.DS-01", description: "The confidentiality, integrity, and availability of data-at-rest are protected", sp80053Mappings: ["SC-28", "MP-2", "MP-4", "MP-5"] },
      { id: "PR.DS-02", description: "The confidentiality, integrity, and availability of data-in-transit are protected", sp80053Mappings: ["SC-8", "SC-13", "SC-23"] },
      { id: "PR.DS-10", description: "The confidentiality, integrity, and availability of data-in-use are protected", sp80053Mappings: ["SC-4", "SI-16"] },
      { id: "PR.DS-11", description: "Backups of data are created, protected, maintained, and tested subject to policy", sp80053Mappings: ["CP-9", "CP-10"] },
    ],
  },
  {
    id: "PR.PS",
    name: "Platform Security",
    function: "PR",
    subcategories: [
      { id: "PR.PS-01", description: "The configuration of organizational assets is established and maintained to support security", sp80053Mappings: ["CM-1", "CM-2", "CM-6", "CM-7"] },
      { id: "PR.PS-02", description: "Software is maintained, replaced, and removed commensurate with risk", sp80053Mappings: ["CM-3", "CM-4", "SA-8", "SA-10", "SI-2", "SI-7"] },
      { id: "PR.PS-03", description: "Hardware is maintained, replaced, and removed commensurate with risk", sp80053Mappings: ["MA-2", "MA-3", "MA-5", "MA-6"] },
      { id: "PR.PS-04", description: "Log records are generated and made available for continuous monitoring", sp80053Mappings: ["AU-2", "AU-3", "AU-6", "AU-12"] },
      { id: "PR.PS-05", description: "Installation and execution of unauthorized software are prevented", sp80053Mappings: ["CM-7", "CM-11", "SI-7", "SI-16"] },
      { id: "PR.PS-06", description: "Secure software development practices are integrated, and their performance is monitored throughout the software development life cycle", sp80053Mappings: ["SA-3", "SA-4", "SA-8", "SA-10", "SA-11", "SA-15", "SA-17"] },
    ],
  },
  {
    id: "PR.IR",
    name: "Technology Infrastructure Resilience",
    function: "PR",
    subcategories: [
      { id: "PR.IR-01", description: "Networks and environments are protected from unauthorized logical access and usage", sp80053Mappings: ["AC-4", "SC-7", "SC-46"] },
      { id: "PR.IR-02", description: "The organization's technology assets are protected from environmental threats", sp80053Mappings: ["PE-1", "PE-9", "PE-10", "PE-11", "PE-13", "PE-14"] },
      { id: "PR.IR-03", description: "Mechanisms are implemented to achieve resilience requirements in normal and adverse situations", sp80053Mappings: ["CP-7", "CP-8", "CP-11", "SC-5", "SC-6", "SC-36"] },
      { id: "PR.IR-04", description: "Adequate resource capacity to ensure availability is maintained", sp80053Mappings: ["CP-2", "SC-5", "SC-6", "PE-11"] },
    ],
  },
  // ── DETECT (DE) ──────────────────────────────────────────────────────────
  {
    id: "DE.CM",
    name: "Continuous Monitoring",
    function: "DE",
    subcategories: [
      { id: "DE.CM-01", description: "Networks and network services are monitored to find potentially adverse events", sp80053Mappings: ["AU-12", "CA-7", "SI-4"] },
      { id: "DE.CM-02", description: "The physical environment is monitored to find potentially adverse events", sp80053Mappings: ["CA-7", "PE-6", "PE-8"] },
      { id: "DE.CM-03", description: "Personnel activity and technology usage are monitored to find potentially adverse events", sp80053Mappings: ["AC-2", "AU-12", "CA-7", "CM-3"] },
      { id: "DE.CM-06", description: "External service provider activities and services are monitored to find potentially adverse events", sp80053Mappings: ["CA-7", "SA-9", "SI-4"] },
      { id: "DE.CM-09", description: "Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events", sp80053Mappings: ["CA-7", "CM-3", "SC-34", "SC-44", "SI-4", "SI-7"] },
    ],
  },
  {
    id: "DE.AE",
    name: "Adverse Event Analysis",
    function: "DE",
    subcategories: [
      { id: "DE.AE-02", description: "Potentially adverse events are analyzed to better understand associated activities", sp80053Mappings: ["AU-6", "CA-7", "IR-4", "SI-4"] },
      { id: "DE.AE-03", description: "Information is correlated from multiple sources", sp80053Mappings: ["AU-6", "IR-4", "SI-4"] },
      { id: "DE.AE-04", description: "The estimated impact and scope of adverse events are understood", sp80053Mappings: ["CP-2", "IR-4", "IR-5"] },
      { id: "DE.AE-06", description: "Information on adverse events is provided to authorized staff and tools", sp80053Mappings: ["AU-6", "CA-7", "IR-4", "SI-4"] },
      { id: "DE.AE-07", description: "Cyber threat intelligence and other contextual information are integrated into the analysis", sp80053Mappings: ["PM-16", "RA-3", "SI-5"] },
      { id: "DE.AE-08", description: "Incidents are declared when adverse events meet the defined incident criteria", sp80053Mappings: ["IR-4", "IR-5"] },
    ],
  },
  // ── RESPOND (RS) ─────────────────────────────────────────────────────────
  {
    id: "RS.MA",
    name: "Incident Management",
    function: "RS",
    subcategories: [
      { id: "RS.MA-01", description: "The incident response plan is executed in coordination with relevant third parties once an incident is declared", sp80053Mappings: ["IR-4", "IR-6"] },
      { id: "RS.MA-02", description: "Incident reports are triaged and validated", sp80053Mappings: ["IR-4", "IR-5"] },
      { id: "RS.MA-03", description: "Incidents are categorized and prioritized", sp80053Mappings: ["IR-4", "IR-5"] },
      { id: "RS.MA-04", description: "Incidents are escalated or elevated as needed", sp80053Mappings: ["IR-4", "IR-6"] },
      { id: "RS.MA-05", description: "The criteria for initiating incident recovery are applied", sp80053Mappings: ["IR-4", "CP-2", "CP-10"] },
    ],
  },
  {
    id: "RS.AN",
    name: "Incident Analysis",
    function: "RS",
    subcategories: [
      { id: "RS.AN-03", description: "Analysis is performed to establish what has taken place during an incident and identify the root cause", sp80053Mappings: ["IR-4", "IR-5", "AU-6"] },
      { id: "RS.AN-06", description: "Actions performed during an investigation are recorded, and the records' integrity and provenance are preserved", sp80053Mappings: ["AU-7", "IR-4"] },
      { id: "RS.AN-07", description: "Incident data and metadata are collected, and their integrity and provenance are preserved", sp80053Mappings: ["AU-7", "IR-4"] },
      { id: "RS.AN-08", description: "An incident's magnitude is estimated and validated", sp80053Mappings: ["IR-4", "IR-5", "CP-2"] },
    ],
  },
  {
    id: "RS.CO",
    name: "Incident Response Reporting and Communication",
    function: "RS",
    subcategories: [
      { id: "RS.CO-02", description: "Internal and external stakeholders are notified of incidents", sp80053Mappings: ["IR-6", "IR-7"] },
      { id: "RS.CO-03", description: "Information is shared with designated internal and external stakeholders", sp80053Mappings: ["IR-6", "IR-7", "PM-16"] },
    ],
  },
  {
    id: "RS.MI",
    name: "Incident Mitigation",
    function: "RS",
    subcategories: [
      { id: "RS.MI-01", description: "Incidents are contained", sp80053Mappings: ["IR-4", "SC-7"] },
      { id: "RS.MI-02", description: "Incidents are eradicated", sp80053Mappings: ["IR-4"] },
    ],
  },
  // ── RECOVER (RC) ─────────────────────────────────────────────────────────
  {
    id: "RC.RP",
    name: "Incident Recovery Plan Execution",
    function: "RC",
    subcategories: [
      { id: "RC.RP-01", description: "The recovery portion of the incident response plan is executed once initiated from the incident response process", sp80053Mappings: ["CP-10", "IR-4"] },
      { id: "RC.RP-02", description: "Recovery actions are selected, scoped, prioritized, and performed", sp80053Mappings: ["CP-10", "IR-4"] },
      { id: "RC.RP-03", description: "The integrity of backups and other restoration assets is verified before using them for restoration", sp80053Mappings: ["CP-9", "CP-10"] },
      { id: "RC.RP-04", description: "Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms", sp80053Mappings: ["CP-2", "CP-10", "IR-4"] },
      { id: "RC.RP-05", description: "The integrity of restored assets is verified, systems and services are restored, and normal operating status is confirmed", sp80053Mappings: ["CP-10", "SI-6", "SI-7"] },
      { id: "RC.RP-06", description: "The end of incident recovery is declared based on criteria, and incident-related documentation is completed", sp80053Mappings: ["CP-2", "IR-4", "IR-8"] },
    ],
  },
  {
    id: "RC.CO",
    name: "Incident Recovery Communication",
    function: "RC",
    subcategories: [
      { id: "RC.CO-03", description: "Recovery activities and progress in restoring operational capabilities are communicated to designated internal and external stakeholders", sp80053Mappings: ["CP-2", "IR-6"] },
      { id: "RC.CO-04", description: "Public updates on incident recovery are shared using approved methods and messaging", sp80053Mappings: ["CP-2", "IR-6", "IR-7"] },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Assessment Logic
// ─────────────────────────────────────────────────────────────────────────────

export async function generateNistCsfAssessment(input: NistCsfInput): Promise<NistCsfAssessment> {
  const functionScores = assessAllFunctions(input);
  const overallTier = determineOverallTier(functionScores, input);
  const gapAnalysis = performGapAnalysis(functionScores, input);
  const prioritizedActions = generatePrioritizedActions(gapAnalysis, input);
  const riskScore = calculateRiskScore(functionScores, input);
  const maturityPercentage = calculateMaturityPercentage(functionScores);
  const regulatoryContext = buildRegulatoryContext(input);

  const executiveSummary = await generateExecutiveSummary(input, overallTier, functionScores, gapAnalysis, riskScore);

  return {
    companyName: input.companyName,
    industry: input.industry,
    assessmentDate: new Date().toISOString().split("T")[0] ?? "",
    frameworkVersion: "2.0",
    overallTier,
    functionScores,
    gapAnalysis,
    prioritizedActions,
    executiveSummary,
    riskScore,
    maturityPercentage,
    regulatoryContext,
  };
}

function assessAllFunctions(input: NistCsfInput): FunctionScore[] {
  const functions: CsfFunction[] = ["GV", "ID", "PR", "DE", "RS", "RC"];
  return functions.map((fn) => assessFunction(fn, input));
}

function assessFunction(functionId: CsfFunction, input: NistCsfInput): FunctionScore {
  const categories = CSF_CATEGORIES.filter((c) => c.function === functionId);
  const categoryScores = categories.map((cat) => assessCategory(cat, input));

  const totalScore = categoryScores.reduce((sum, cs) => sum + cs.score, 0);
  const totalMax = categoryScores.reduce((sum, cs) => sum + cs.maxScore, 0);
  const percentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const strengths = identifyStrengths(categoryScores, functionId, input);
  const weaknesses = identifyWeaknesses(categoryScores, functionId, input);
  const implementationTier = deriveFunctionTier(percentage);

  return {
    functionId,
    functionName: CSF_FUNCTION_NAMES[functionId],
    score: totalScore,
    maxScore: totalMax,
    percentage,
    categories: categoryScores,
    strengths,
    weaknesses,
    implementationTier,
  };
}

function assessCategory(category: CategoryDefinition, input: NistCsfInput): CategoryScore {
  const subcategoryAssessments = category.subcategories.map((sub) => assessSubcategory(sub, category, input));

  const score = subcategoryAssessments.reduce((sum, s) => sum + s.score, 0);
  const maxScore = subcategoryAssessments.length * 4;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  let maturityLevel: CategoryScore["maturityLevel"];
  if (percentage >= 85) maturityLevel = "Fully Implemented";
  else if (percentage >= 60) maturityLevel = "Largely Implemented";
  else if (percentage >= 30) maturityLevel = "Partially Implemented";
  else maturityLevel = "Not Implemented";

  return {
    categoryId: category.id,
    categoryName: category.name,
    subcategories: subcategoryAssessments,
    score,
    maxScore,
    percentage,
    maturityLevel,
  };
}

function assessSubcategory(
  sub: SubcategoryDefinition,
  category: CategoryDefinition,
  input: NistCsfInput
): SubcategoryAssessment {
  const score = calculateSubcategoryScore(sub, category, input);
  const currentState = scoreToState(score);
  const evidence = determineEvidence(sub, input);
  const gaps = determineGaps(sub, category, input, score);

  return {
    subcategoryId: sub.id,
    description: sub.description,
    currentState,
    score,
    evidence,
    gaps,
    sp80053Mapping: sub.sp80053Mappings,
  };
}

function calculateSubcategoryScore(
  sub: SubcategoryDefinition,
  category: CategoryDefinition,
  input: NistCsfInput
): number {
  let score = 0;

  // Base score from program description keyword matching
  const programLower = input.currentProgram.toLowerCase();
  const toolsLower = input.existingTools.map((t) => t.toLowerCase());
  const complianceLower = input.existingCompliance.map((c) => c.toLowerCase());

  // Evaluate based on function area
  switch (category.function) {
    case "GV":
      score += evaluateGovernScore(sub, programLower, toolsLower, complianceLower, input);
      break;
    case "ID":
      score += evaluateIdentifyScore(sub, programLower, toolsLower, complianceLower, input);
      break;
    case "PR":
      score += evaluateProtectScore(sub, programLower, toolsLower, complianceLower, input);
      break;
    case "DE":
      score += evaluateDetectScore(sub, programLower, toolsLower, complianceLower, input);
      break;
    case "RS":
      score += evaluateRespondScore(sub, programLower, toolsLower, complianceLower, input);
      break;
    case "RC":
      score += evaluateRecoverScore(sub, programLower, toolsLower, complianceLower, input);
      break;
  }

  // Cap at max score of 4
  return Math.min(Math.max(score, 0), 4);
}

function evaluateGovernScore(
  sub: SubcategoryDefinition,
  program: string,
  tools: string[],
  compliance: string[],
  input: NistCsfInput
): number {
  let score = 0;

  const governKeywords: Record<string, string[]> = {
    "GV.OC": ["mission", "stakeholder", "legal", "regulatory", "compliance", "obligation", "objective", "service"],
    "GV.RM": ["risk management", "risk appetite", "risk tolerance", "risk strategy", "enterprise risk", "prioritiz"],
    "GV.RR": ["ciso", "security officer", "leadership", "accountab", "responsib", "role", "resource", "budget", "hr"],
    "GV.PO": ["policy", "procedure", "standard", "framework", "governance"],
    "GV.SC": ["supply chain", "vendor", "third party", "third-party", "supplier", "contract", "procurement"],
  };

  const categoryPrefix = sub.id.substring(0, 5);
  const keywords = governKeywords[categoryPrefix] ?? [];

  for (const kw of keywords) {
    if (program.includes(kw)) score += 0.5;
  }

  // Existing compliance frameworks add governance maturity
  if (compliance.some((c) => c.includes("iso 27001") || c.includes("iso27001"))) score += 1;
  if (compliance.some((c) => c.includes("soc 2") || c.includes("soc2"))) score += 0.5;
  if (compliance.some((c) => c.includes("nist"))) score += 0.5;

  // GRC tools indicate governance maturity
  if (tools.some((t) => t.includes("grc") || t.includes("governance"))) score += 1;

  // Larger organizations tend to have more governance structure
  if (input.employeeCount > 500) score += 0.5;
  if (input.employeeCount > 2000) score += 0.5;

  return Math.min(score, 4);
}

function evaluateIdentifyScore(
  sub: SubcategoryDefinition,
  program: string,
  tools: string[],
  compliance: string[],
  input: NistCsfInput
): number {
  let score = 0;

  const identifyKeywords: Record<string, string[]> = {
    "ID.AM": ["asset", "inventory", "cmdb", "hardware", "software", "network", "data classification", "lifecycle"],
    "ID.RA": ["risk assessment", "vulnerability", "threat", "penetration test", "pentest", "threat intelligence", "vuln scan"],
    "ID.IM": ["improvement", "lesson", "audit", "exercise", "test", "tabletop", "after-action"],
  };

  const categoryPrefix = sub.id.substring(0, 5);
  const keywords = identifyKeywords[categoryPrefix] ?? [];

  for (const kw of keywords) {
    if (program.includes(kw)) score += 0.5;
  }

  // Tool-based scoring
  if (categoryPrefix === "ID.AM") {
    if (tools.some((t) => t.includes("cmdb") || t.includes("asset") || t.includes("servicenow"))) score += 1.5;
    if (tools.some((t) => t.includes("discovery") || t.includes("inventory"))) score += 1;
  }

  if (categoryPrefix === "ID.RA") {
    if (tools.some((t) => t.includes("qualys") || t.includes("tenable") || t.includes("nessus") || t.includes("rapid7"))) score += 1.5;
    if (tools.some((t) => t.includes("threat intel") || t.includes("misp") || t.includes("recorded future"))) score += 1;
    if (program.includes("penetration") || program.includes("pentest")) score += 1;
  }

  if (categoryPrefix === "ID.IM") {
    if (input.recentIncidents.some((i) => i.lessonsLearned && i.lessonsLearned.length > 0)) score += 1;
    if (program.includes("continual improvement") || program.includes("continuous improvement")) score += 1;
  }

  if (compliance.some((c) => c.includes("iso 27001") || c.includes("iso27001"))) score += 0.5;

  return Math.min(score, 4);
}

function evaluateProtectScore(
  sub: SubcategoryDefinition,
  program: string,
  tools: string[],
  compliance: string[],
  _input: NistCsfInput
): number {
  let score = 0;

  const protectKeywords: Record<string, string[]> = {
    "PR.AA": ["identity", "access control", "mfa", "multi-factor", "sso", "single sign", "least privilege", "rbac", "physical access"],
    "PR.AT": ["training", "awareness", "phishing", "education"],
    "PR.DS": ["encryption", "encrypt", "data protection", "backup", "data-at-rest", "data-in-transit", "dlp"],
    "PR.PS": ["configuration", "hardening", "patch", "sdlc", "secure develop", "baseline", "logging"],
    "PR.IR": ["network segmentation", "firewall", "redundan", "resilien", "failover", "high availability"],
  };

  const categoryPrefix = sub.id.substring(0, 5);
  const keywords = protectKeywords[categoryPrefix] ?? [];

  for (const kw of keywords) {
    if (program.includes(kw)) score += 0.5;
  }

  // Tool-based scoring for Protect
  if (categoryPrefix === "PR.AA") {
    if (tools.some((t) => t.includes("okta") || t.includes("azure ad") || t.includes("entra") || t.includes("sso"))) score += 1.5;
    if (tools.some((t) => t.includes("mfa") || t.includes("duo") || t.includes("yubikey"))) score += 1;
    if (tools.some((t) => t.includes("pam") || t.includes("cyberark") || t.includes("beyondtrust"))) score += 0.5;
  }

  if (categoryPrefix === "PR.AT") {
    if (tools.some((t) => t.includes("knowbe4") || t.includes("proofpoint") || t.includes("training"))) score += 2;
  }

  if (categoryPrefix === "PR.DS") {
    if (tools.some((t) => t.includes("encryption") || t.includes("vault") || t.includes("kms"))) score += 1;
    if (tools.some((t) => t.includes("backup") || t.includes("veeam") || t.includes("commvault"))) score += 1;
    if (tools.some((t) => t.includes("dlp"))) score += 0.5;
  }

  if (categoryPrefix === "PR.PS") {
    if (tools.some((t) => t.includes("sast") || t.includes("snyk") || t.includes("sonarqube") || t.includes("checkmarx"))) score += 1;
    if (tools.some((t) => t.includes("ansible") || t.includes("terraform") || t.includes("chef") || t.includes("puppet"))) score += 1;
    if (tools.some((t) => t.includes("siem") || t.includes("splunk") || t.includes("sentinel"))) score += 0.5;
  }

  if (categoryPrefix === "PR.IR") {
    if (tools.some((t) => t.includes("firewall") || t.includes("palo alto") || t.includes("fortinet"))) score += 1;
    if (tools.some((t) => t.includes("waf") || t.includes("cloudflare") || t.includes("akamai"))) score += 1;
  }

  if (compliance.some((c) => c.includes("pci") || c.includes("hipaa"))) score += 0.5;

  return Math.min(score, 4);
}

function evaluateDetectScore(
  sub: SubcategoryDefinition,
  program: string,
  tools: string[],
  compliance: string[],
  input: NistCsfInput
): number {
  let score = 0;

  const detectKeywords: Record<string, string[]> = {
    "DE.CM": ["monitor", "siem", "soc", "logging", "alerting", "detection", "ids", "ips", "ndr", "edr"],
    "DE.AE": ["analysis", "correlat", "threat intelligence", "incident criteria", "triage", "impact"],
  };

  const categoryPrefix = sub.id.substring(0, 5);
  const keywords = detectKeywords[categoryPrefix] ?? [];

  for (const kw of keywords) {
    if (program.includes(kw)) score += 0.5;
  }

  // SIEM/monitoring tools
  if (tools.some((t) => t.includes("splunk") || t.includes("sentinel") || t.includes("elastic") || t.includes("siem"))) score += 1.5;
  if (tools.some((t) => t.includes("crowdstrike") || t.includes("sentinel one") || t.includes("edr"))) score += 1;
  if (tools.some((t) => t.includes("darktrace") || t.includes("ndr") || t.includes("network detection"))) score += 0.5;

  // SOC presence
  if (program.includes("soc") || program.includes("security operations center")) score += 1;
  if (program.includes("24/7") || program.includes("24x7")) score += 0.5;

  // Incident history shows detection capability
  if (input.recentIncidents.length > 0 && input.recentIncidents.some((i) => i.resolved)) score += 0.5;

  if (compliance.some((c) => c.includes("soc 2") || c.includes("soc2"))) score += 0.5;

  return Math.min(score, 4);
}

function evaluateRespondScore(
  sub: SubcategoryDefinition,
  program: string,
  tools: string[],
  _compliance: string[],
  input: NistCsfInput
): number {
  let score = 0;

  const respondKeywords: Record<string, string[]> = {
    "RS.MA": ["incident response", "incident management", "ir plan", "playbook", "runbook", "escalat"],
    "RS.AN": ["forensic", "root cause", "investigation", "evidence", "chain of custody"],
    "RS.CO": ["communication", "notification", "stakeholder", "disclosure", "reporting"],
    "RS.MI": ["containment", "contain", "eradicat", "isolat", "mitigat"],
  };

  const categoryPrefix = sub.id.substring(0, 5);
  const keywords = respondKeywords[categoryPrefix] ?? [];

  for (const kw of keywords) {
    if (program.includes(kw)) score += 0.5;
  }

  // IR-specific tooling
  if (tools.some((t) => t.includes("pagerduty") || t.includes("opsgenie") || t.includes("incident"))) score += 1;
  if (tools.some((t) => t.includes("soar") || t.includes("xsoar") || t.includes("phantom") || t.includes("swimlane"))) score += 1.5;
  if (tools.some((t) => t.includes("jira") || t.includes("servicenow"))) score += 0.5;

  // Incident history indicates response capability
  const resolvedIncidents = input.recentIncidents.filter((i) => i.resolved);
  if (resolvedIncidents.length > 0) score += 1;
  if (resolvedIncidents.some((i) => i.lessonsLearned && i.lessonsLearned.length > 0)) score += 0.5;

  // Larger organizations typically have more formalized response
  if (input.employeeCount > 200) score += 0.5;

  return Math.min(score, 4);
}

function evaluateRecoverScore(
  sub: SubcategoryDefinition,
  program: string,
  tools: string[],
  compliance: string[],
  input: NistCsfInput
): number {
  let score = 0;

  const recoverKeywords: Record<string, string[]> = {
    "RC.RP": ["recovery", "disaster recovery", "dr plan", "bcp", "business continuity", "restore", "backup", "rto", "rpo", "failover"],
    "RC.CO": ["communication plan", "public relation", "crisis communication", "status page", "stakeholder notification"],
  };

  const categoryPrefix = sub.id.substring(0, 5);
  const keywords = recoverKeywords[categoryPrefix] ?? [];

  for (const kw of keywords) {
    if (program.includes(kw)) score += 0.5;
  }

  // DR/BCP tooling
  if (tools.some((t) => t.includes("backup") || t.includes("veeam") || t.includes("commvault") || t.includes("cohesity"))) score += 1;
  if (tools.some((t) => t.includes("dr") || t.includes("zerto") || t.includes("site recovery"))) score += 1.5;
  if (tools.some((t) => t.includes("status page") || t.includes("statuspage"))) score += 0.5;

  // Compliance frameworks that require recovery planning
  if (compliance.some((c) => c.includes("iso 22301") || c.includes("iso22301"))) score += 1.5;
  if (compliance.some((c) => c.includes("soc 2") || c.includes("soc2"))) score += 0.5;

  // Incident recovery history
  if (input.recentIncidents.some((i) => i.resolved && i.severity === "Critical")) score += 1;

  return Math.min(score, 4);
}

function scoreToState(score: number): SubcategoryAssessment["currentState"] {
  if (score >= 3.5) return "Fully Implemented";
  if (score >= 2.5) return "Largely Implemented";
  if (score >= 1.0) return "Partially Implemented";
  return "Not Implemented";
}

function determineEvidence(sub: SubcategoryDefinition, input: NistCsfInput): string[] {
  const evidence: string[] = [];

  if (input.currentProgram.length > 0) {
    evidence.push("Cybersecurity program documentation reviewed");
  }

  if (input.existingTools.length > 0) {
    evidence.push(`Existing tooling inventory: ${input.existingTools.length} tools identified`);
  }

  if (input.existingCompliance.length > 0) {
    evidence.push(`Active compliance certifications: ${input.existingCompliance.join(", ")}`);
  }

  if (input.recentIncidents.length > 0) {
    evidence.push(`Incident history reviewed: ${input.recentIncidents.length} incidents documented`);
  }

  if (sub.sp80053Mappings.length > 0) {
    evidence.push(`Mapped to NIST SP 800-53 controls: ${sub.sp80053Mappings.join(", ")}`);
  }

  return evidence;
}

function determineGaps(
  sub: SubcategoryDefinition,
  category: CategoryDefinition,
  input: NistCsfInput,
  score: number
): string[] {
  const gaps: string[] = [];

  if (score < 2) {
    gaps.push(`${sub.id}: Insufficient implementation — ${sub.description}`);
  }

  if (score < 3 && category.function === "GV") {
    if (!input.currentProgram.toLowerCase().includes("policy")) {
      gaps.push("Formal cybersecurity governance policies may not be documented or communicated");
    }
  }

  if (score < 3 && category.function === "ID") {
    if (!input.existingTools.some((t) => t.toLowerCase().includes("asset") || t.toLowerCase().includes("cmdb"))) {
      gaps.push("Asset management tooling gap — no automated discovery or inventory solution identified");
    }
  }

  if (score < 3 && category.function === "PR") {
    if (!input.existingTools.some((t) => t.toLowerCase().includes("mfa") || t.toLowerCase().includes("sso"))) {
      gaps.push("Identity and access management gap — MFA/SSO enforcement not confirmed");
    }
  }

  if (score < 3 && category.function === "DE") {
    if (!input.existingTools.some((t) => t.toLowerCase().includes("siem") || t.toLowerCase().includes("monitor"))) {
      gaps.push("Continuous monitoring gap — no SIEM or centralized monitoring identified");
    }
  }

  if (score < 3 && category.function === "RS") {
    if (!input.currentProgram.toLowerCase().includes("incident response")) {
      gaps.push("Incident response plan not documented or may not be tested regularly");
    }
  }

  if (score < 3 && category.function === "RC") {
    if (!input.currentProgram.toLowerCase().includes("recovery") && !input.currentProgram.toLowerCase().includes("bcp")) {
      gaps.push("Recovery/business continuity planning gap — formal DR/BCP not confirmed");
    }
  }

  return gaps;
}

function identifyStrengths(categoryScores: CategoryScore[], functionId: CsfFunction, input: NistCsfInput): string[] {
  const strengths: string[] = [];

  const highScoring = categoryScores.filter((cs) => cs.percentage >= 60);
  for (const cs of highScoring) {
    strengths.push(`Strong ${cs.categoryName} practices (${cs.percentage}% coverage)`);
  }

  if (functionId === "GV" && input.existingCompliance.length > 0) {
    strengths.push(`Existing compliance program covers: ${input.existingCompliance.join(", ")}`);
  }

  if (functionId === "PR" && input.existingTools.length >= 5) {
    strengths.push("Comprehensive security tooling stack deployed");
  }

  if (functionId === "DE" && input.existingTools.some((t) => t.toLowerCase().includes("siem"))) {
    strengths.push("SIEM-based detection capability established");
  }

  if (functionId === "RS" && input.recentIncidents.some((i) => i.resolved && i.lessonsLearned)) {
    strengths.push("Demonstrated incident response capability with lessons-learned practice");
  }

  if (functionId === "RC" && input.existingTools.some((t) => t.toLowerCase().includes("backup"))) {
    strengths.push("Backup infrastructure in place to support recovery operations");
  }

  return strengths.length > 0 ? strengths : [`${CSF_FUNCTION_NAMES[functionId]} function requires further development`];
}

function identifyWeaknesses(categoryScores: CategoryScore[], functionId: CsfFunction, input: NistCsfInput): string[] {
  const weaknesses: string[] = [];

  const lowScoring = categoryScores.filter((cs) => cs.percentage < 40);
  for (const cs of lowScoring) {
    weaknesses.push(`${cs.categoryName} needs significant improvement (${cs.percentage}% coverage)`);
  }

  if (functionId === "GV" && !input.currentProgram.toLowerCase().includes("governance")) {
    weaknesses.push("Cybersecurity governance structure may not be formally defined");
  }

  if (functionId === "ID" && !input.existingTools.some((t) => t.toLowerCase().includes("asset"))) {
    weaknesses.push("No automated asset discovery or management tooling identified");
  }

  if (functionId === "PR" && input.existingTools.length < 3) {
    weaknesses.push("Limited security tooling may leave protection gaps");
  }

  if (functionId === "DE" && !input.existingTools.some((t) => {
    const lower = t.toLowerCase();
    return lower.includes("siem") || lower.includes("splunk") || lower.includes("sentinel");
  })) {
    weaknesses.push("No centralized detection/monitoring platform identified");
  }

  if (functionId === "RS" && input.recentIncidents.some((i) => !i.resolved)) {
    weaknesses.push("Unresolved incidents indicate potential response capability gaps");
  }

  if (functionId === "RC" && !input.currentProgram.toLowerCase().includes("disaster recovery")) {
    weaknesses.push("Disaster recovery planning not evident in current program description");
  }

  return weaknesses;
}

function deriveFunctionTier(percentage: number): ImplementationTier {
  if (percentage >= 80) return 4;
  if (percentage >= 60) return 3;
  if (percentage >= 35) return 2;
  return 1;
}

function determineOverallTier(functionScores: FunctionScore[], input: NistCsfInput): TierAssessment {
  const tierValues = functionScores.map((fs) => fs.implementationTier);
  const avgTier = tierValues.reduce((sum, t) => sum + t, 0) / tierValues.length;
  const currentTier = Math.round(avgTier) as ImplementationTier;
  const targetTier = input.targetTier ?? Math.min(currentTier + 1, 4) as ImplementationTier;

  const tierByFunction: Record<CsfFunction, ImplementationTier> = {
    GV: functionScores.find((f) => f.functionId === "GV")?.implementationTier ?? 1,
    ID: functionScores.find((f) => f.functionId === "ID")?.implementationTier ?? 1,
    PR: functionScores.find((f) => f.functionId === "PR")?.implementationTier ?? 1,
    DE: functionScores.find((f) => f.functionId === "DE")?.implementationTier ?? 1,
    RS: functionScores.find((f) => f.functionId === "RS")?.implementationTier ?? 1,
    RC: functionScores.find((f) => f.functionId === "RC")?.implementationTier ?? 1,
  };

  const riskManagementProcessScore = calculateRiskManagementProcessScore(functionScores, input);
  const integratedRiskManagementScore = calculateIntegratedRiskManagementScore(functionScores, input);
  const externalParticipationScore = calculateExternalParticipationScore(input);

  const tierJustification = buildTierJustification(currentTier, tierByFunction, input);

  return {
    currentTier,
    currentTierLabel: TIER_LABELS[currentTier],
    targetTier,
    targetTierLabel: TIER_LABELS[targetTier],
    tierJustification,
    tierByFunction,
    riskManagementProcessScore,
    integratedRiskManagementScore,
    externalParticipationScore,
  };
}

function calculateRiskManagementProcessScore(functionScores: FunctionScore[], input: NistCsfInput): number {
  const govScore = functionScores.find((f) => f.functionId === "GV");
  const idScore = functionScores.find((f) => f.functionId === "ID");

  let score = 0;
  if (govScore) score += govScore.percentage * 0.4;
  if (idScore) score += idScore.percentage * 0.3;
  if (input.currentProgram.toLowerCase().includes("risk")) score += 15;
  if (input.existingCompliance.length > 0) score += 15;

  return Math.min(Math.round(score), 100);
}

function calculateIntegratedRiskManagementScore(functionScores: FunctionScore[], input: NistCsfInput): number {
  const avgPercentage = functionScores.reduce((sum, f) => sum + f.percentage, 0) / functionScores.length;
  let score = avgPercentage * 0.6;

  if (input.existingCompliance.length >= 2) score += 20;
  if (input.employeeCount > 500) score += 10;
  if (input.currentProgram.toLowerCase().includes("enterprise risk")) score += 10;

  return Math.min(Math.round(score), 100);
}

function calculateExternalParticipationScore(input: NistCsfInput): number {
  let score = 0;

  if (input.existingCompliance.some((c) => c.toLowerCase().includes("iso"))) score += 25;
  if (input.existingCompliance.some((c) => c.toLowerCase().includes("soc"))) score += 20;
  if (input.currentProgram.toLowerCase().includes("information sharing")) score += 15;
  if (input.currentProgram.toLowerCase().includes("isac") || input.currentProgram.toLowerCase().includes("isao")) score += 20;
  if (input.existingTools.some((t) => t.toLowerCase().includes("threat intel"))) score += 15;
  if (input.currentProgram.toLowerCase().includes("third party") || input.currentProgram.toLowerCase().includes("vendor")) score += 15;

  return Math.min(score, 100);
}

function buildTierJustification(
  tier: ImplementationTier,
  tierByFunction: Record<CsfFunction, ImplementationTier>,
  input: NistCsfInput
): string {
  const functionNames = Object.entries(tierByFunction)
    .map(([fn, t]) => `${CSF_FUNCTION_NAMES[fn as CsfFunction]}: Tier ${t}`)
    .join("; ");

  const justifications: Record<ImplementationTier, string> = {
    1: `The organization operates at Tier 1 (Partial). Cybersecurity risk management is ad hoc, with limited awareness of organizational cybersecurity risk. Risk management practices are not formalized and risk is managed reactively. Per-function assessment: ${functionNames}. With ${input.employeeCount} employees in the ${input.industry} sector, immediate governance improvements are recommended.`,
    2: `The organization operates at Tier 2 (Risk Informed). Risk management practices are approved by management but may not be established as organization-wide policy. Awareness of cybersecurity risk exists at the organizational level but a consistent approach is not established. Per-function assessment: ${functionNames}. The existing program (${input.existingCompliance.length} compliance frameworks) demonstrates risk awareness but integration needs strengthening.`,
    3: `The organization operates at Tier 3 (Repeatable). Risk management practices are formally approved and expressed as policy. Organizational cybersecurity practices are regularly updated based on changes in requirements and threat landscape. Per-function assessment: ${functionNames}. The organization demonstrates consistent risk management with ${input.existingTools.length} security tools and ${input.existingCompliance.length} active compliance certifications.`,
    4: `The organization operates at Tier 4 (Adaptive). The organization adapts its cybersecurity practices based on previous and current activities, including lessons learned and predictive indicators. Continuous improvement through advanced technologies and practices is demonstrated. Per-function assessment: ${functionNames}. The organization exhibits adaptive cybersecurity risk management with integrated processes across the enterprise.`,
  };

  return justifications[tier];
}

function performGapAnalysis(functionScores: FunctionScore[], input: NistCsfInput): GapAnalysisResult {
  const allGaps: GapItem[] = [];
  let gapCounter = 1;

  const gapsByFunction: Record<CsfFunction, number> = { GV: 0, ID: 0, PR: 0, DE: 0, RS: 0, RC: 0 };

  for (const fn of functionScores) {
    for (const cat of fn.categories) {
      for (const sub of cat.subcategories) {
        if (sub.currentState !== "Fully Implemented") {
          const gap = buildGapItem(sub, cat, fn, gapCounter, input);
          allGaps.push(gap);
          gapsByFunction[fn.functionId]++;
          gapCounter++;
        }
      }
    }
  }

  const criticalGaps = allGaps.filter((g) => g.impact === "Critical");
  const highGaps = allGaps.filter((g) => g.impact === "High");
  const mediumGaps = allGaps.filter((g) => g.impact === "Medium");
  const lowGaps = allGaps.filter((g) => g.impact === "Low");

  const totalSubcategories = CSF_CATEGORIES.reduce((sum, c) => sum + c.subcategories.length, 0);
  const implementedCount = functionScores
    .flatMap((f) => f.categories)
    .flatMap((c) => c.subcategories)
    .filter((s) => s.currentState === "Fully Implemented").length;
  const partialCount = functionScores
    .flatMap((f) => f.categories)
    .flatMap((c) => c.subcategories)
    .filter((s) => s.currentState === "Partially Implemented" || s.currentState === "Largely Implemented").length;

  const targetTier = input.targetTier ?? (Math.min(Math.round(
    functionScores.reduce((sum, f) => sum + f.implementationTier, 0) / functionScores.length
  ) + 1, 4) as ImplementationTier);

  const currentProfileSummary: ProfileSummary = {
    tier: Math.round(functionScores.reduce((sum, f) => sum + f.implementationTier, 0) / functionScores.length) as ImplementationTier,
    totalSubcategories,
    implemented: implementedCount,
    partiallyImplemented: partialCount,
    notImplemented: totalSubcategories - implementedCount - partialCount,
    coveragePercentage: Math.round((implementedCount / totalSubcategories) * 100),
  };

  const targetProfileSummary: ProfileSummary = {
    tier: targetTier,
    totalSubcategories,
    implemented: Math.round(totalSubcategories * getTargetCoverage(targetTier)),
    partiallyImplemented: Math.round(totalSubcategories * (1 - getTargetCoverage(targetTier)) * 0.6),
    notImplemented: Math.round(totalSubcategories * (1 - getTargetCoverage(targetTier)) * 0.4),
    coveragePercentage: Math.round(getTargetCoverage(targetTier) * 100),
  };

  return {
    totalGaps: allGaps.length,
    criticalGaps,
    highGaps,
    mediumGaps,
    lowGaps,
    currentProfileSummary,
    targetProfileSummary,
    gapsByFunction,
  };
}

function getTargetCoverage(tier: ImplementationTier): number {
  const coverageMap: Record<ImplementationTier, number> = { 1: 0.25, 2: 0.50, 3: 0.75, 4: 0.90 };
  return coverageMap[tier];
}

function buildGapItem(
  sub: SubcategoryAssessment,
  category: CategoryScore,
  fn: FunctionScore,
  counter: number,
  input: NistCsfInput
): GapItem {
  const impact = determineGapImpact(sub, fn.functionId, input);
  const effort = determineGapEffort(sub, fn.functionId);
  const timeline = estimateTimeline(effort, impact);
  const remediation = generateRemediationSteps(sub, fn.functionId, input);
  const regulatoryImplication = determineRegulatoryImplication(sub, fn.functionId, input);

  return {
    id: `GAP-${String(counter).padStart(3, "0")}`,
    categoryId: category.categoryId,
    subcategoryId: sub.subcategoryId,
    description: sub.description,
    currentState: sub.currentState,
    targetState: "Fully Implemented",
    impact,
    effort,
    estimatedTimelineWeeks: timeline,
    remediationSteps: remediation,
    regulatoryImplication,
  };
}

function determineGapImpact(
  sub: SubcategoryAssessment,
  functionId: CsfFunction,
  input: NistCsfInput
): GapItem["impact"] {
  // Critical gaps: core governance, access control, incident response in critical industries
  const criticalSubcategories = [
    "GV.RR-01", "GV.RM-01", "PR.AA-03", "PR.AA-05", "PR.DS-01", "PR.DS-02",
    "DE.CM-01", "RS.MA-01", "RC.RP-01",
  ];

  if (criticalSubcategories.includes(sub.subcategoryId) && sub.currentState === "Not Implemented") {
    return "Critical";
  }

  const criticalIndustries = ["healthcare", "financial", "banking", "energy", "utilities", "government", "defense"];
  if (criticalIndustries.some((ind) => input.industry.toLowerCase().includes(ind))) {
    if (sub.currentState === "Not Implemented" && (functionId === "PR" || functionId === "DE")) {
      return "Critical";
    }
  }

  if (sub.currentState === "Not Implemented") return "High";
  if (sub.currentState === "Partially Implemented" && (functionId === "PR" || functionId === "GV")) return "High";
  if (sub.currentState === "Partially Implemented") return "Medium";
  return "Low";
}

function determineGapEffort(sub: SubcategoryAssessment, functionId: CsfFunction): GapItem["effort"] {
  if (sub.currentState === "Largely Implemented") return "Low";

  const highEffortFunctions: CsfFunction[] = ["GV", "PR"];
  if (sub.currentState === "Not Implemented" && highEffortFunctions.includes(functionId)) return "Very High";
  if (sub.currentState === "Not Implemented") return "High";
  if (sub.currentState === "Partially Implemented" && functionId === "GV") return "High";

  return "Medium";
}

function estimateTimeline(effort: GapItem["effort"], impact: GapItem["impact"]): number {
  const baseWeeks: Record<string, number> = { Low: 2, Medium: 6, High: 12, "Very High": 24 };
  let weeks = baseWeeks[effort] ?? 8;

  // Critical impact items get expedited timelines
  if (impact === "Critical") weeks = Math.max(Math.round(weeks * 0.7), 2);

  return weeks;
}

function generateRemediationSteps(
  _sub: SubcategoryAssessment,
  functionId: CsfFunction,
  input: NistCsfInput
): string[] {
  const steps: string[] = [];

  switch (functionId) {
    case "GV":
      steps.push("Establish formal cybersecurity governance charter and organizational structure");
      steps.push("Document and communicate cybersecurity policies to all stakeholders");
      steps.push("Define risk appetite and tolerance levels with executive approval");
      steps.push("Implement periodic governance review cadence (quarterly minimum)");
      if (!input.existingTools.some((t) => t.toLowerCase().includes("grc"))) {
        steps.push("Evaluate and deploy GRC platform to manage governance artifacts");
      }
      break;
    case "ID":
      steps.push("Conduct comprehensive asset discovery and inventory baseline");
      steps.push("Implement automated vulnerability scanning on defined schedule");
      steps.push("Establish threat intelligence feeds and integration with risk processes");
      steps.push("Document risk assessment methodology and perform initial assessment");
      steps.push("Create risk register with scoring, ownership, and treatment plans");
      break;
    case "PR":
      steps.push("Implement or verify MFA enforcement across all critical systems");
      steps.push("Deploy least-privilege access model with quarterly access reviews");
      steps.push("Verify encryption at rest and in transit for all sensitive data");
      steps.push("Establish secure development lifecycle (SDLC) with security gates");
      steps.push("Deploy configuration management and hardening baselines");
      break;
    case "DE":
      steps.push("Deploy centralized logging and SIEM correlation platform");
      steps.push("Develop detection rules aligned with MITRE ATT&CK framework");
      steps.push("Establish alert triage procedures and escalation thresholds");
      steps.push("Implement network and endpoint detection and response (NDR/EDR)");
      steps.push("Define and test incident declaration criteria");
      break;
    case "RS":
      steps.push("Develop formal incident response plan with defined roles and procedures");
      steps.push("Establish incident classification and severity framework");
      steps.push("Conduct tabletop exercises quarterly and full simulations annually");
      steps.push("Implement forensic evidence collection and chain-of-custody procedures");
      steps.push("Define internal/external communication templates and procedures");
      break;
    case "RC":
      steps.push("Develop disaster recovery plan with defined RTO/RPO objectives");
      steps.push("Implement automated backup verification and integrity testing");
      steps.push("Conduct DR failover testing semi-annually at minimum");
      steps.push("Establish crisis communication plan and status notification procedures");
      steps.push("Document post-incident recovery criteria and operational norms");
      break;
  }

  return steps;
}

function determineRegulatoryImplication(
  sub: SubcategoryAssessment,
  functionId: CsfFunction,
  input: NistCsfInput
): string {
  const industry = input.industry.toLowerCase();

  if (industry.includes("health")) {
    if (functionId === "PR" || functionId === "DE") {
      return "HIPAA Security Rule (45 CFR 164.312) requires implementation of technical safeguards; gaps may constitute non-compliance";
    }
    if (functionId === "RS") {
      return "HIPAA Breach Notification Rule (45 CFR 164.404) requires incident response and notification capabilities";
    }
  }

  if (industry.includes("financ") || industry.includes("bank")) {
    if (functionId === "GV" || functionId === "ID") {
      return "GLBA Safeguards Rule (16 CFR 314) and OCC Heightened Standards require formalized risk governance";
    }
    if (functionId === "PR") {
      return "PCI DSS v4.0 and GLBA require specific protective controls for cardholder/financial data";
    }
  }

  if (industry.includes("energy") || industry.includes("utilit")) {
    if (functionId === "PR" || functionId === "DE") {
      return "NERC CIP standards require specific protections and monitoring for bulk electric system cyber assets";
    }
  }

  if (industry.includes("government") || industry.includes("federal")) {
    return `FISMA (44 USC 3551) and OMB A-130 require NIST-based security programs; gap in ${sub.subcategoryId} may affect ATO`;
  }

  // Generic regulatory implications
  const genericImplications: Record<CsfFunction, string> = {
    GV: "SEC cybersecurity disclosure rules (17 CFR 229.106) require board-level governance; state privacy laws may mandate documented programs",
    ID: "Multiple regulatory frameworks require asset identification and risk assessment (e.g., state breach notification laws, FTC Act Section 5)",
    PR: "FTC Act Section 5, state data protection laws, and industry standards require reasonable protective measures",
    DE: "Regulatory expectations for continuous monitoring per industry standards; detection gaps increase breach notification exposure",
    RS: "State breach notification laws (all 50 states) and federal sector requirements mandate incident response capabilities",
    RC: "Business continuity requirements exist across regulatory frameworks; SEC business continuity rules for regulated entities",
  };

  return genericImplications[functionId];
}

function generatePrioritizedActions(gapAnalysis: GapAnalysisResult, input: NistCsfInput): PrioritizedAction[] {
  const actions: PrioritizedAction[] = [];
  let priority = 1;

  // Critical gaps first
  for (const gap of gapAnalysis.criticalGaps.slice(0, 5)) {
    actions.push(buildPrioritizedAction(gap, priority, input));
    priority++;
  }

  // High-impact quick wins
  const quickWins = gapAnalysis.highGaps.filter((g) => g.effort === "Low" || g.effort === "Medium").slice(0, 3);
  for (const gap of quickWins) {
    const action = buildPrioritizedAction(gap, priority, input);
    action.quickWin = true;
    actions.push(action);
    priority++;
  }

  // Remaining high gaps
  const remainingHigh = gapAnalysis.highGaps
    .filter((g) => !quickWins.includes(g))
    .slice(0, 5);
  for (const gap of remainingHigh) {
    actions.push(buildPrioritizedAction(gap, priority, input));
    priority++;
  }

  // Medium gaps for foundational improvement
  for (const gap of gapAnalysis.mediumGaps.slice(0, 5)) {
    actions.push(buildPrioritizedAction(gap, priority, input));
    priority++;
  }

  return actions;
}

function buildPrioritizedAction(gap: GapItem, priority: number, input: NistCsfInput): PrioritizedAction {
  const category = CSF_CATEGORIES.find((c) => c.id === gap.categoryId);
  const functionId = category?.function ?? "GV";

  return {
    priority,
    actionId: `ACT-${String(priority).padStart(3, "0")}`,
    title: buildActionTitle(gap),
    description: gap.remediationSteps.join("; "),
    csfReference: gap.subcategoryId,
    category: functionId,
    effort: gap.effort,
    impact: gap.impact,
    estimatedCost: estimateCost(gap, input),
    estimatedTimelineWeeks: gap.estimatedTimelineWeeks,
    dependencies: identifyDependencies(gap, functionId),
    quickWin: gap.effort === "Low" && (gap.impact === "Critical" || gap.impact === "High"),
    regulatoryDriver: gap.regulatoryImplication,
  };
}

function buildActionTitle(gap: GapItem): string {
  const verb = gap.currentState === "Not Implemented" ? "Implement" : "Strengthen";
  const shortDesc = gap.description.length > 80
    ? gap.description.substring(0, 77) + "..."
    : gap.description;
  return `${verb}: ${shortDesc}`;
}

function estimateCost(gap: GapItem, input: NistCsfInput): CostEstimate {
  const sizeMultiplier = input.employeeCount > 1000 ? 1.5 : input.employeeCount > 200 ? 1.2 : 1.0;

  const baseCosts: Record<string, { range: string; category: CostEstimate["category"] }> = {
    Low: { range: "$5,000 - $15,000", category: "Minimal" },
    Medium: { range: "$15,000 - $75,000", category: "Low" },
    High: { range: "$75,000 - $250,000", category: "Moderate" },
    "Very High": { range: "$250,000 - $750,000", category: "Significant" },
  };

  const fallback: CostEstimate = { range: "$15,000 - $75,000", category: "Low" };
  const base = baseCosts[gap.effort] ?? fallback;

  if (sizeMultiplier > 1.2) {
    const upgraded: Record<string, CostEstimate> = {
      Low: { range: "$10,000 - $30,000", category: "Low" },
      Medium: { range: "$30,000 - $150,000", category: "Moderate" },
      High: { range: "$150,000 - $500,000", category: "Significant" },
      "Very High": { range: "$500,000 - $1,500,000", category: "Major" },
    };
    return upgraded[gap.effort] ?? base;
  }

  return base;
}

function identifyDependencies(_gap: GapItem, functionId: CsfFunction): string[] {
  const dependencies: string[] = [];

  // Governance is foundational
  if (functionId !== "GV") {
    dependencies.push("GV.PO-01: Cybersecurity policy must be established");
  }

  // Identify supports Protect
  if (functionId === "PR") {
    dependencies.push("ID.AM-01: Asset inventory required for targeted protection");
  }

  // Protect supports Detect
  if (functionId === "DE") {
    dependencies.push("PR.PS-04: Logging infrastructure must be in place");
  }

  // Detect supports Respond
  if (functionId === "RS") {
    dependencies.push("DE.AE-08: Incident declaration criteria must be defined");
  }

  // Respond feeds Recover
  if (functionId === "RC") {
    dependencies.push("RS.MA-05: Recovery initiation criteria must be applied");
  }

  return dependencies;
}

function calculateRiskScore(functionScores: FunctionScore[], input: NistCsfInput): number {
  // Risk score: 0 (lowest risk) to 100 (highest risk)
  const avgPercentage = functionScores.reduce((sum, f) => sum + f.percentage, 0) / functionScores.length;
  let riskScore = 100 - avgPercentage;

  // Industry risk adjustment
  const highRiskIndustries = ["healthcare", "financial", "banking", "energy", "government", "defense"];
  if (highRiskIndustries.some((ind) => input.industry.toLowerCase().includes(ind))) {
    riskScore += 10;
  }

  // Recent incidents increase risk
  const criticalIncidents = input.recentIncidents.filter((i) => i.severity === "Critical" || i.severity === "High");
  riskScore += criticalIncidents.length * 5;

  // Unresolved incidents significantly increase risk
  const unresolvedCritical = input.recentIncidents.filter((i) => !i.resolved && (i.severity === "Critical" || i.severity === "High"));
  riskScore += unresolvedCritical.length * 10;

  return Math.min(Math.max(Math.round(riskScore), 0), 100);
}

function calculateMaturityPercentage(functionScores: FunctionScore[]): number {
  const totalScore = functionScores.reduce((sum, f) => sum + f.score, 0);
  const totalMax = functionScores.reduce((sum, f) => sum + f.maxScore, 0);
  return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
}

function buildRegulatoryContext(input: NistCsfInput): RegulatoryContext {
  const applicableFrameworks: string[] = ["NIST CSF 2.0 (NIST CSWP 29)"];
  const crossMappings: CrossMapping[] = [];
  const industrySpecificRequirements: string[] = [];

  const industry = input.industry.toLowerCase();

  // Always applicable
  applicableFrameworks.push("NIST SP 800-53 Rev. 5");
  crossMappings.push({
    nistCsfCategory: "All Functions",
    mappedFramework: "NIST SP 800-53 Rev. 5",
    mappedControl: "Multiple control families",
    description: "CSF 2.0 subcategories map directly to SP 800-53 control families via informative references",
  });

  if (input.existingCompliance.some((c) => c.toLowerCase().includes("iso 27001")) || input.employeeCount > 100) {
    applicableFrameworks.push("ISO/IEC 27001:2022");
    crossMappings.push({
      nistCsfCategory: "GV, ID, PR",
      mappedFramework: "ISO/IEC 27001:2022",
      mappedControl: "Annex A Controls (A.5 - A.8)",
      description: "ISO 27001 ISMS requirements align with CSF Govern, Identify, and Protect functions",
    });
  }

  if (industry.includes("health")) {
    applicableFrameworks.push("HIPAA Security Rule (45 CFR 164)");
    applicableFrameworks.push("HITECH Act");
    industrySpecificRequirements.push(
      "HIPAA Security Rule requires administrative, physical, and technical safeguards (45 CFR 164.308-312)"
    );
    industrySpecificRequirements.push(
      "Breach notification required within 60 days of discovery (45 CFR 164.404)"
    );
    crossMappings.push({
      nistCsfCategory: "PR.AA, PR.DS",
      mappedFramework: "HIPAA Security Rule",
      mappedControl: "45 CFR 164.312",
      description: "Technical safeguards for access control and transmission security map to CSF Protect function",
    });
  }

  if (industry.includes("financ") || industry.includes("bank") || industry.includes("insurance")) {
    applicableFrameworks.push("GLBA Safeguards Rule (16 CFR 314)");
    applicableFrameworks.push("FFIEC Cybersecurity Assessment Tool");
    industrySpecificRequirements.push(
      "GLBA requires comprehensive information security program with designated coordinator"
    );
    industrySpecificRequirements.push(
      "NY DFS 23 NYCRR 500 requires CISO designation, penetration testing, and incident response plan"
    );
    crossMappings.push({
      nistCsfCategory: "GV.RR, ID.RA",
      mappedFramework: "GLBA Safeguards Rule",
      mappedControl: "16 CFR 314.4",
      description: "Safeguards Rule elements map to CSF governance and risk assessment categories",
    });
  }

  if (industry.includes("energy") || industry.includes("utilit") || industry.includes("electric")) {
    applicableFrameworks.push("NERC CIP Standards");
    industrySpecificRequirements.push(
      "NERC CIP-002 through CIP-014 require specific controls for bulk electric system cyber assets"
    );
    industrySpecificRequirements.push(
      "CIP-008 requires incident reporting to E-ISAC within defined timelines"
    );
    crossMappings.push({
      nistCsfCategory: "PR.PS, DE.CM",
      mappedFramework: "NERC CIP",
      mappedControl: "CIP-005, CIP-007",
      description: "Electronic security perimeter and system security management map to CSF Protect and Detect",
    });
  }

  if (industry.includes("government") || industry.includes("federal") || industry.includes("defense")) {
    applicableFrameworks.push("FISMA (44 USC 3551-3558)");
    applicableFrameworks.push("FedRAMP");
    applicableFrameworks.push("CMMC 2.0");
    industrySpecificRequirements.push(
      "FISMA requires NIST-based security categorization and control selection per FIPS 199/200"
    );
    industrySpecificRequirements.push(
      "CMMC 2.0 Level 2 requires implementation of 110 NIST SP 800-171 Rev. 2 security requirements"
    );
    crossMappings.push({
      nistCsfCategory: "All Functions",
      mappedFramework: "CMMC 2.0",
      mappedControl: "Level 2 Practices",
      description: "CMMC Level 2 aligns with NIST SP 800-171 which maps to CSF subcategories",
    });
  }

  if (industry.includes("retail") || industry.includes("e-commerce") || industry.includes("payment")) {
    applicableFrameworks.push("PCI DSS v4.0");
    industrySpecificRequirements.push(
      "PCI DSS v4.0 requires specific controls for cardholder data environments with March 2025 deadline"
    );
    crossMappings.push({
      nistCsfCategory: "PR.AA, PR.DS, DE.CM",
      mappedFramework: "PCI DSS v4.0",
      mappedControl: "Requirements 1-12",
      description: "PCI DSS requirements map across CSF Protect and Detect functions",
    });
  }

  // SEC rules apply broadly to public companies
  if (input.employeeCount > 500) {
    applicableFrameworks.push("SEC Cybersecurity Disclosure Rules (17 CFR 229.106, 249.220)");
    industrySpecificRequirements.push(
      "SEC rules require material cybersecurity incident disclosure within 4 business days (Form 8-K Item 1.05)"
    );
    industrySpecificRequirements.push(
      "Annual disclosure of cybersecurity risk management, strategy, and governance (Regulation S-K Item 106)"
    );
  }

  // State privacy laws
  industrySpecificRequirements.push(
    "State breach notification laws (all 50 states) require notification within 30-90 days depending on jurisdiction"
  );

  return {
    applicableFrameworks,
    crossMappings,
    industrySpecificRequirements,
  };
}

async function generateExecutiveSummary(
  input: NistCsfInput,
  tierAssessment: TierAssessment,
  functionScores: FunctionScore[],
  gapAnalysis: GapAnalysisResult,
  riskScore: number
): Promise<string> {
  const systemPrompt = `You are a senior cybersecurity consultant preparing an executive summary for a NIST Cybersecurity Framework 2.0 assessment. Write in professional, direct language suitable for C-suite and board presentation. Reference specific NIST CSF 2.0 functions and categories. Be concise but comprehensive.`;

  const functionSummaries = functionScores
    .map((f) => `${f.functionName} (${f.functionId}): ${f.percentage}% — Tier ${f.implementationTier} (${TIER_LABELS[f.implementationTier]})`)
    .join("\n");

  const topGaps = gapAnalysis.criticalGaps
    .slice(0, 3)
    .map((g) => `${g.subcategoryId}: ${g.description}`)
    .join("\n");

  const userPrompt = `Generate a 3-4 paragraph executive summary for the following NIST CSF 2.0 assessment:

Organization: ${input.companyName}
Industry: ${input.industry}
Employees: ${input.employeeCount}
Current Implementation Tier: ${tierAssessment.currentTier} (${tierAssessment.currentTierLabel})
Target Tier: ${tierAssessment.targetTier} (${tierAssessment.targetTierLabel})
Overall Risk Score: ${riskScore}/100
Total Gaps Identified: ${gapAnalysis.totalGaps}
Critical Gaps: ${gapAnalysis.criticalGaps.length}

Function Scores:
${functionSummaries}

Top Critical Gaps:
${topGaps}

Existing Compliance: ${input.existingCompliance.join(", ") || "None documented"}
Existing Tools: ${input.existingTools.length} security tools deployed
Recent Incidents: ${input.recentIncidents.length} (${input.recentIncidents.filter((i) => !i.resolved).length} unresolved)

Provide: (1) overall posture assessment, (2) key risk areas, (3) strategic recommendations to reach target tier, (4) business impact context for the ${input.industry} sector.`;

  const summary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 2048,
  });

  return summary;
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Formatting
// ─────────────────────────────────────────────────────────────────────────────

export function formatNistCsfReport(assessment: NistCsfAssessment): string {
  const sections: string[] = [];

  sections.push(formatHeader(assessment));
  sections.push(formatExecutiveSummary(assessment));
  sections.push(formatTierAssessment(assessment));
  sections.push(formatFunctionScores(assessment));
  sections.push(formatGapAnalysis(assessment));
  sections.push(formatPrioritizedActions(assessment));
  sections.push(formatRegulatoryContext(assessment));
  sections.push(formatMethodology());
  sections.push(formatDisclaimer(assessment));

  return sections.join("\n\n");
}

function formatHeader(assessment: NistCsfAssessment): string {
  return `# NIST Cybersecurity Framework 2.0 Assessment Report

**Organization:** ${assessment.companyName}
**Industry:** ${assessment.industry}
**Assessment Date:** ${assessment.assessmentDate}
**Framework Version:** NIST CSF ${assessment.frameworkVersion} (NIST CSWP 29, February 2024)

---

| Metric | Value |
|--------|-------|
| Overall Implementation Tier | Tier ${assessment.overallTier.currentTier} — ${assessment.overallTier.currentTierLabel} |
| Target Implementation Tier | Tier ${assessment.overallTier.targetTier} — ${assessment.overallTier.targetTierLabel} |
| Risk Score | ${assessment.riskScore}/100 |
| Maturity Percentage | ${assessment.maturityPercentage}% |
| Total Gaps Identified | ${assessment.gapAnalysis.totalGaps} |
| Critical Gaps | ${assessment.gapAnalysis.criticalGaps.length} |

---`;
}

function formatExecutiveSummary(assessment: NistCsfAssessment): string {
  return `## Executive Summary

${assessment.executiveSummary}`;
}

function formatTierAssessment(assessment: NistCsfAssessment): string {
  const tier = assessment.overallTier;

  const tierTable = Object.entries(tier.tierByFunction)
    .map(([fn, t]) => `| ${CSF_FUNCTION_NAMES[fn as CsfFunction]} (${fn}) | Tier ${t} | ${TIER_LABELS[t]} |`)
    .join("\n");

  return `## Implementation Tier Assessment

### Overall Tier Determination

${tier.tierJustification}

### Tier by Function

| Function | Tier | Label |
|----------|------|-------|
${tierTable}

### Tier Dimension Scores

| Dimension | Score |
|-----------|-------|
| Risk Management Process | ${tier.riskManagementProcessScore}/100 |
| Integrated Risk Management Program | ${tier.integratedRiskManagementScore}/100 |
| External Participation | ${tier.externalParticipationScore}/100 |

### NIST CSF 2.0 Tier Definitions Reference

| Tier | Name | Characteristics |
|------|------|-----------------|
| 1 | Partial | Ad hoc; limited awareness; risk managed reactively |
| 2 | Risk Informed | Management-approved practices; awareness exists but not org-wide |
| 3 | Repeatable | Formally approved policies; regularly updated; consistent approach |
| 4 | Adaptive | Adapts based on lessons learned; continuous improvement; predictive |`;
}

function formatFunctionScores(assessment: NistCsfAssessment): string {
  let output = `## Function Assessment Scores\n\n`;

  // Summary table
  output += `| Function | Score | Percentage | Tier |\n`;
  output += `|----------|-------|------------|------|\n`;
  for (const fn of assessment.functionScores) {
    output += `| ${fn.functionName} (${fn.functionId}) | ${fn.score}/${fn.maxScore} | ${fn.percentage}% | Tier ${fn.implementationTier} |\n`;
  }

  output += `\n---\n`;

  // Detailed per-function breakdown
  for (const fn of assessment.functionScores) {
    output += `\n### ${fn.functionId}: ${fn.functionName}\n\n`;
    output += `**Score:** ${fn.score}/${fn.maxScore} (${fn.percentage}%) | **Tier:** ${fn.implementationTier} (${TIER_LABELS[fn.implementationTier]})\n\n`;

    if (fn.strengths.length > 0) {
      output += `**Strengths:**\n`;
      for (const s of fn.strengths) {
        output += `- ${s}\n`;
      }
      output += `\n`;
    }

    if (fn.weaknesses.length > 0) {
      output += `**Weaknesses:**\n`;
      for (const w of fn.weaknesses) {
        output += `- ${w}\n`;
      }
      output += `\n`;
    }

    // Category detail table
    output += `| Category | Score | Maturity |\n`;
    output += `|----------|-------|----------|\n`;
    for (const cat of fn.categories) {
      output += `| ${cat.categoryId}: ${cat.categoryName} | ${cat.score}/${cat.maxScore} (${cat.percentage}%) | ${cat.maturityLevel} |\n`;
    }
    output += `\n`;

    // Subcategory details for categories below threshold
    const weakCategories = fn.categories.filter((c) => c.percentage < 60);
    if (weakCategories.length > 0) {
      output += `**Subcategory Detail (Categories Below 60%):**\n\n`;
      for (const cat of weakCategories) {
        output += `*${cat.categoryId}: ${cat.categoryName}*\n\n`;
        output += `| Subcategory | State | Gaps |\n`;
        output += `|-------------|-------|------|\n`;
        for (const sub of cat.subcategories) {
          const gapSummary = sub.gaps.length > 0 ? sub.gaps[0] ?? "—" : "—";
          const truncatedGap = gapSummary.length > 80 ? gapSummary.substring(0, 77) + "..." : gapSummary;
          output += `| ${sub.subcategoryId} | ${sub.currentState} | ${truncatedGap} |\n`;
        }
        output += `\n`;
      }
    }
  }

  return output;
}

function formatGapAnalysis(assessment: NistCsfAssessment): string {
  const gap = assessment.gapAnalysis;

  let output = `## Gap Analysis: Current vs. Target Profile\n\n`;

  // Profile comparison
  output += `### Profile Comparison\n\n`;
  output += `| Metric | Current Profile | Target Profile | Delta |\n`;
  output += `|--------|----------------|----------------|-------|\n`;
  output += `| Tier | ${gap.currentProfileSummary.tier} | ${gap.targetProfileSummary.tier} | +${gap.targetProfileSummary.tier - gap.currentProfileSummary.tier} |\n`;
  output += `| Fully Implemented | ${gap.currentProfileSummary.implemented} | ${gap.targetProfileSummary.implemented} | +${gap.targetProfileSummary.implemented - gap.currentProfileSummary.implemented} |\n`;
  output += `| Partially Implemented | ${gap.currentProfileSummary.partiallyImplemented} | ${gap.targetProfileSummary.partiallyImplemented} | ${gap.targetProfileSummary.partiallyImplemented - gap.currentProfileSummary.partiallyImplemented} |\n`;
  output += `| Not Implemented | ${gap.currentProfileSummary.notImplemented} | ${gap.targetProfileSummary.notImplemented} | ${gap.targetProfileSummary.notImplemented - gap.currentProfileSummary.notImplemented} |\n`;
  output += `| Coverage | ${gap.currentProfileSummary.coveragePercentage}% | ${gap.targetProfileSummary.coveragePercentage}% | +${gap.targetProfileSummary.coveragePercentage - gap.currentProfileSummary.coveragePercentage}% |\n`;

  output += `\n### Gaps by Function\n\n`;
  output += `| Function | Gap Count |\n`;
  output += `|----------|----------|\n`;
  for (const [fn, count] of Object.entries(gap.gapsByFunction)) {
    output += `| ${CSF_FUNCTION_NAMES[fn as CsfFunction]} (${fn}) | ${count} |\n`;
  }

  // Critical gaps detail
  if (gap.criticalGaps.length > 0) {
    output += `\n### Critical Gaps (Immediate Action Required)\n\n`;
    for (const g of gap.criticalGaps) {
      output += `#### ${g.id}: ${g.subcategoryId}\n\n`;
      output += `**Description:** ${g.description}\n`;
      output += `**Current State:** ${g.currentState} | **Target:** ${g.targetState}\n`;
      output += `**Effort:** ${g.effort} | **Timeline:** ${g.estimatedTimelineWeeks} weeks\n`;
      output += `**Regulatory Implication:** ${g.regulatoryImplication}\n\n`;
      output += `**Remediation Steps:**\n`;
      for (const step of g.remediationSteps) {
        output += `1. ${step}\n`;
      }
      output += `\n`;
    }
  }

  // High gaps summary
  if (gap.highGaps.length > 0) {
    output += `### High-Priority Gaps\n\n`;
    output += `| ID | Subcategory | Current State | Effort | Timeline |\n`;
    output += `|----|-------------|---------------|--------|----------|\n`;
    for (const g of gap.highGaps.slice(0, 10)) {
      output += `| ${g.id} | ${g.subcategoryId} | ${g.currentState} | ${g.effort} | ${g.estimatedTimelineWeeks}w |\n`;
    }
    if (gap.highGaps.length > 10) {
      output += `\n*... and ${gap.highGaps.length - 10} additional high-priority gaps*\n`;
    }
  }

  return output;
}

function formatPrioritizedActions(assessment: NistCsfAssessment): string {
  let output = `## Prioritized Action Plan\n\n`;

  output += `The following actions are prioritized based on risk impact, regulatory requirements, effort level, and dependency relationships.\n\n`;

  // Quick wins section
  const quickWins = assessment.prioritizedActions.filter((a) => a.quickWin);
  if (quickWins.length > 0) {
    output += `### Quick Wins (High Impact, Low Effort)\n\n`;
    for (const action of quickWins) {
      output += `**${action.priority}. ${action.title}**\n`;
      output += `- CSF Reference: ${action.csfReference}\n`;
      output += `- Estimated Cost: ${action.estimatedCost.range}\n`;
      output += `- Timeline: ${action.estimatedTimelineWeeks} weeks\n`;
      output += `- Regulatory Driver: ${action.regulatoryDriver}\n\n`;
    }
  }

  // Full action table
  output += `### Complete Action Plan\n\n`;
  output += `| # | Action | CSF Ref | Impact | Effort | Cost | Timeline |\n`;
  output += `|---|--------|---------|--------|--------|------|----------|\n`;
  for (const action of assessment.prioritizedActions) {
    const shortTitle = action.title.length > 50 ? action.title.substring(0, 47) + "..." : action.title;
    output += `| ${action.priority} | ${shortTitle} | ${action.csfReference} | ${action.impact} | ${action.effort} | ${action.estimatedCost.range} | ${action.estimatedTimelineWeeks}w |\n`;
  }

  // Detailed breakdown for top actions
  output += `\n### Detailed Action Descriptions\n\n`;
  for (const action of assessment.prioritizedActions.slice(0, 8)) {
    output += `#### ${action.priority}. ${action.title}\n\n`;
    output += `| Attribute | Value |\n`;
    output += `|-----------|-------|\n`;
    output += `| CSF Reference | ${action.csfReference} |\n`;
    output += `| Function | ${CSF_FUNCTION_NAMES[action.category]} (${action.category}) |\n`;
    output += `| Impact | ${action.impact} |\n`;
    output += `| Effort | ${action.effort} |\n`;
    output += `| Estimated Cost | ${action.estimatedCost.range} (${action.estimatedCost.category}) |\n`;
    output += `| Timeline | ${action.estimatedTimelineWeeks} weeks |\n`;
    output += `| Quick Win | ${action.quickWin ? "Yes" : "No"} |\n\n`;
    output += `**Description:** ${action.description}\n\n`;
    output += `**Regulatory Driver:** ${action.regulatoryDriver}\n\n`;
    if (action.dependencies.length > 0) {
      output += `**Dependencies:**\n`;
      for (const dep of action.dependencies) {
        output += `- ${dep}\n`;
      }
      output += `\n`;
    }
  }

  return output;
}

function formatRegulatoryContext(assessment: NistCsfAssessment): string {
  const reg = assessment.regulatoryContext;

  let output = `## Regulatory Context & Cross-Framework Mapping\n\n`;

  output += `### Applicable Regulatory Frameworks\n\n`;
  for (const fw of reg.applicableFrameworks) {
    output += `- ${fw}\n`;
  }

  output += `\n### Industry-Specific Requirements\n\n`;
  for (const req of reg.industrySpecificRequirements) {
    output += `- ${req}\n`;
  }

  output += `\n### Cross-Framework Control Mappings\n\n`;
  output += `| CSF Category | Mapped Framework | Mapped Control | Description |\n`;
  output += `|--------------|------------------|----------------|-------------|\n`;
  for (const mapping of reg.crossMappings) {
    output += `| ${mapping.nistCsfCategory} | ${mapping.mappedFramework} | ${mapping.mappedControl} | ${mapping.description} |\n`;
  }

  return output;
}

function formatMethodology(): string {
  return `## Assessment Methodology

### Framework Reference
This assessment is conducted against the **NIST Cybersecurity Framework (CSF) 2.0**, published February 26, 2024 (NIST CSWP 29). CSF 2.0 is applicable to all organizations regardless of sector or size and introduces the Govern function as the sixth core function.

### Scoring Methodology
- Each subcategory is assessed on a 0-4 scale:
  - **0:** Not Implemented — no evidence of implementation
  - **1:** Partially Implemented — ad hoc or inconsistent implementation
  - **2-3:** Largely Implemented — systematic implementation with minor gaps
  - **4:** Fully Implemented — complete, documented, tested, and continuously improved
- Category scores are aggregated from subcategory assessments
- Function scores are aggregated from category assessments
- Overall tier is derived from function-level tier assessments per NIST guidance

### Tier Determination
Implementation Tiers (1-4) are assessed across three dimensions per NIST CSF 2.0 guidance:
1. **Risk Management Process** — formality and documentation of cyber risk management
2. **Integrated Risk Management Program** — integration with enterprise risk
3. **External Participation** — collaboration with external parties and information sharing

### Gap Analysis
Gaps are identified by comparing current subcategory implementation states against the target profile. Each gap is assessed for:
- **Impact:** Based on regulatory implications, business criticality, and threat exposure
- **Effort:** Based on organizational complexity, technical requirements, and resource needs
- **Timeline:** Estimated weeks to remediate based on effort and priority

### Limitations
- This assessment is based on information provided and does not constitute a formal audit
- Scoring reflects organizational self-assessment supplemented by automated analysis
- Actual implementation effectiveness requires independent verification through testing
- Regulatory compliance determination requires legal counsel review

### References
- NIST Cybersecurity Framework 2.0 (NIST CSWP 29): https://doi.org/10.6028/NIST.CSWP.29
- NIST SP 800-53 Rev. 5: Security and Privacy Controls for Information Systems
- NIST SP 800-55 Rev. 2: Performance Measurement Guide for Information Security
- NIST SP 800-37 Rev. 2: Risk Management Framework for Information Systems
- NIST SP 800-171 Rev. 2: Protecting Controlled Unclassified Information`;
}

function formatDisclaimer(assessment: NistCsfAssessment): string {
  return `---

## Disclaimer

This NIST CSF 2.0 assessment report for **${assessment.companyName}** was generated on ${assessment.assessmentDate} using automated analysis supplemented by AI-assisted evaluation. This report:

1. **Does not constitute a formal certification or audit** — NIST CSF is a voluntary framework and does not have a formal certification process.
2. **Is based on self-reported information** — accuracy depends on the completeness and accuracy of inputs provided.
3. **Should be validated by qualified professionals** — organizations should engage qualified cybersecurity professionals for independent assessment.
4. **Does not constitute legal advice** — regulatory compliance determinations should be reviewed by legal counsel.
5. **Represents a point-in-time assessment** — cybersecurity posture changes continuously and this assessment should be refreshed periodically.

For questions regarding this assessment or to schedule a follow-up review, contact your designated cybersecurity governance lead.

---
*Generated in accordance with NIST Cybersecurity Framework 2.0 (NIST CSWP 29, February 2024)*`;
}
