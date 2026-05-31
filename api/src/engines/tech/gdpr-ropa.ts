/**
 * GDPR Records of Processing Activities (ROPA) Generator
 * Per GDPR Article 30
 */

import { generateCompletion } from "../../lib/llm.js";

export interface RopaInput {
  controllerName: string;
  controllerContact: string;
  controllerAddress: string;
  dpoName: string;
  dpoContact: string;
  euRepresentative: EuRepresentative | null;
  processingActivities: ProcessingActivityInput[];
}

export interface EuRepresentative {
  name: string;
  address: string;
  contact: string;
}

export interface ProcessingActivityInput {
  activityName: string;
  department: string;
  purposeOfProcessing: string[];
  legalBasis: string;
  categoriesOfDataSubjects: string[];
  categoriesOfPersonalData: string[];
  specialCategoryData: boolean;
  specialCategoryJustification: string;
  categoriesOfRecipients: string[];
  thirdCountryTransfers: ThirdCountryTransfer[];
  retentionPeriod: string;
  retentionJustification: string;
  securityMeasures: string[];
  dataSource: string;
  automatedDecisionMaking: boolean;
  jointController: string | null;
  processor: string | null;
}

export interface ThirdCountryTransfer {
  country: string;
  recipient: string;
  safeguardMechanism: string;
  safeguardDocumentation: string;
}

export interface RopaDocument {
  title: string;
  version: string;
  lastUpdated: string;
  nextReviewDate: string;
  controller: ControllerDetails;
  totalActivities: number;
  activities: ProcessingActivityRecord[];
  summary: string;
}

export interface ControllerDetails {
  name: string;
  address: string;
  contact: string;
  dpoName: string;
  dpoContact: string;
  euRepresentative: EuRepresentative | null;
}

export interface ProcessingActivityRecord {
  id: string;
  activityName: string;
  department: string;
  purposes: string[];
  legalBasis: string;
  dataSubjectCategories: string[];
  personalDataCategories: string[];
  specialCategoryData: boolean;
  specialCategoryJustification: string;
  recipients: string[];
  thirdCountryTransfers: ThirdCountryTransfer[];
  retentionPeriod: string;
  retentionJustification: string;
  securityMeasuresDescription: string;
  dataSource: string;
  automatedDecisionMaking: boolean;
  jointController: string | null;
  processor: string | null;
  lastReviewDate: string;
  status: "Active" | "Under Review" | "Archived";
}

export async function generateRopa(input: RopaInput): Promise<RopaDocument> {
  const activities = buildProcessingActivityRecords(input);

  const systemPrompt = `You are a GDPR compliance expert generating a Records of Processing Activities (ROPA) summary per Article 30.`;

  const userPrompt = `Generate a summary statement for this ROPA register:
Controller: ${input.controllerName}
DPO: ${input.dpoName}
Total Processing Activities: ${input.processingActivities.length}
Activities: ${input.processingActivities.map((a) => a.activityName).join(", ")}
Special Category Data: ${input.processingActivities.filter((a) => a.specialCategoryData).length} activities involve special category data
International Transfers: ${input.processingActivities.filter((a) => a.thirdCountryTransfers.length > 0).length} activities involve international transfers

Provide a 2-paragraph summary describing the ROPA's coverage, compliance with Article 30 requirements, and any notable aspects (e.g., special category processing, international transfers).`;

  const summary = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 1024,
  });

  const today = new Date().toISOString().split("T")[0] ?? "";
  const nextReview = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "";

  return {
    title: `Records of Processing Activities — ${input.controllerName}`,
    version: "1.0",
    lastUpdated: today,
    nextReviewDate: nextReview,
    controller: {
      name: input.controllerName,
      address: input.controllerAddress,
      contact: input.controllerContact,
      dpoName: input.dpoName,
      dpoContact: input.dpoContact,
      euRepresentative: input.euRepresentative,
    },
    totalActivities: activities.length,
    activities,
    summary,
  };
}

function buildProcessingActivityRecords(input: RopaInput): ProcessingActivityRecord[] {
  const today = new Date().toISOString().split("T")[0] ?? "";

  return input.processingActivities.map((activity, index) => ({
    id: `PA-${String(index + 1).padStart(3, "0")}`,
    activityName: activity.activityName,
    department: activity.department,
    purposes: activity.purposeOfProcessing,
    legalBasis: activity.legalBasis,
    dataSubjectCategories: activity.categoriesOfDataSubjects,
    personalDataCategories: activity.categoriesOfPersonalData,
    specialCategoryData: activity.specialCategoryData,
    specialCategoryJustification: activity.specialCategoryData
      ? activity.specialCategoryJustification
      : "N/A — no special category data processed",
    recipients: activity.categoriesOfRecipients,
    thirdCountryTransfers: activity.thirdCountryTransfers,
    retentionPeriod: activity.retentionPeriod,
    retentionJustification: activity.retentionJustification,
    securityMeasuresDescription: buildSecurityMeasuresDescription(activity.securityMeasures),
    dataSource: activity.dataSource,
    automatedDecisionMaking: activity.automatedDecisionMaking,
    jointController: activity.jointController,
    processor: activity.processor,
    lastReviewDate: today,
    status: "Active" as const,
  }));
}

function buildSecurityMeasuresDescription(measures: string[]): string {
  if (measures.length === 0) {
    return "General description of technical and organizational security measures: Standard organizational security controls in place including access controls, encryption, and monitoring. Detailed measures documented in the Information Security Policy.";
  }

  const categorizedMeasures = categorizeMeasures(measures);

  let description = "Technical and organizational measures implemented to ensure appropriate security (Article 32):";

  if (categorizedMeasures.technical.length > 0) {
    description += `\n\nTechnical Measures:\n${categorizedMeasures.technical.map((m) => `- ${m}`).join("\n")}`;
  }

  if (categorizedMeasures.organizational.length > 0) {
    description += `\n\nOrganizational Measures:\n${categorizedMeasures.organizational.map((m) => `- ${m}`).join("\n")}`;
  }

  return description;
}

interface CategorizedMeasures {
  technical: string[];
  organizational: string[];
}

function categorizeMeasures(measures: string[]): CategorizedMeasures {
  const technicalKeywords = [
    "encrypt", "firewall", "backup", "access control", "authentication",
    "mfa", "tls", "ssl", "antivirus", "endpoint", "monitoring", "logging",
    "vulnerability", "scan", "patch", "network", "ids", "ips", "dlp",
  ];

  const technical: string[] = [];
  const organizational: string[] = [];

  for (const measure of measures) {
    const lowerMeasure = measure.toLowerCase();
    const isTechnical = technicalKeywords.some((keyword) => lowerMeasure.includes(keyword));
    if (isTechnical) {
      technical.push(measure);
    } else {
      organizational.push(measure);
    }
  }

  return { technical, organizational };
}

export function formatRopaAsTable(document: RopaDocument): string {
  let output = `# ${document.title}\n\n`;
  output += `**Version:** ${document.version} | **Last Updated:** ${document.lastUpdated} | **Next Review:** ${document.nextReviewDate}\n\n`;
  output += `## Controller Information\n\n`;
  output += `| Field | Details |\n|-------|--------|\n`;
  output += `| Controller Name | ${document.controller.name} |\n`;
  output += `| Address | ${document.controller.address} |\n`;
  output += `| Contact | ${document.controller.contact} |\n`;
  output += `| DPO | ${document.controller.dpoName} (${document.controller.dpoContact}) |\n`;

  if (document.controller.euRepresentative) {
    output += `| EU Representative | ${document.controller.euRepresentative.name} — ${document.controller.euRepresentative.address} |\n`;
  }

  output += `\n---\n\n## Processing Activities Register\n\n`;

  for (const activity of document.activities) {
    output += `### ${activity.id}: ${activity.activityName}\n\n`;
    output += `| Article 30 Requirement | Details |\n|------------------------|--------|\n`;
    output += `| Department | ${activity.department} |\n`;
    output += `| Purposes | ${activity.purposes.join("; ")} |\n`;
    output += `| Legal Basis | ${activity.legalBasis} |\n`;
    output += `| Data Subject Categories | ${activity.dataSubjectCategories.join("; ")} |\n`;
    output += `| Personal Data Categories | ${activity.personalDataCategories.join("; ")} |\n`;
    output += `| Special Category Data | ${activity.specialCategoryData ? `Yes — ${activity.specialCategoryJustification}` : "No"} |\n`;
    output += `| Recipients | ${activity.recipients.join("; ")} |\n`;

    if (activity.thirdCountryTransfers.length > 0) {
      output += `| Third Country Transfers | ${activity.thirdCountryTransfers.map((t) => `${t.recipient} (${t.country}) — ${t.safeguardMechanism}`).join("; ")} |\n`;
    } else {
      output += `| Third Country Transfers | None |\n`;
    }

    output += `| Retention Period | ${activity.retentionPeriod} — ${activity.retentionJustification} |\n`;
    output += `| Data Source | ${activity.dataSource} |\n`;
    output += `| Automated Decisions | ${activity.automatedDecisionMaking ? "Yes" : "No"} |\n`;

    if (activity.jointController) {
      output += `| Joint Controller | ${activity.jointController} |\n`;
    }

    if (activity.processor) {
      output += `| Processor | ${activity.processor} |\n`;
    }

    output += `| Security Measures | ${activity.securityMeasuresDescription.replace(/\n/g, " ")} |\n`;
    output += `| Status | ${activity.status} |\n`;
    output += `| Last Review | ${activity.lastReviewDate} |\n`;
    output += `\n---\n\n`;
  }

  return output;
}
