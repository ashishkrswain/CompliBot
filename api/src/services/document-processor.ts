import { generateStructuredOutput } from "../lib/llm.js";
import { DOCUMENT_EXTRACTION_PROMPT } from "../lib/prompts.js";

export interface IncidentRecord {
  date: string;
  caseNumber: string;
  employeeJobTitle: string;
  department: string;
  description: string;
  injuryType: string;
  bodyPart: string;
  outcome: "death" | "days_away" | "restricted_transfer" | "other_recordable";
  daysAway: number;
  daysRestricted: number;
  location: string;
}

export interface ChemicalRecord {
  chemicalName: string;
  casNumber: string;
  quantity: number;
  unit: string;
  location: string;
  hazardClasses: string[];
  storageType: string;
  storagePressure: string;
  storageTemperature: string;
  daysOnSite: number;
}

export interface TrainingRecord {
  employeeName: string;
  employeeId: string;
  course: string;
  completionDate: string;
  expirationDate: string;
  certified: boolean;
  provider: string;
}

export interface MaintenanceRecord {
  equipmentId: string;
  equipmentName: string;
  serviceType: string;
  date: string;
  technician: string;
  findings: string;
  actionTaken: string;
  nextServiceDue: string;
  condition: "good" | "fair" | "poor" | "critical";
}

export interface InspectionRecord {
  location: string;
  hazardType: string;
  severity: "imminent_danger" | "serious" | "other_than_serious" | "de_minimis";
  description: string;
  standard: string;
  correctiveAction: string;
  photoRef: string;
}

export type ExtractedRecords =
  | { dataType: "incidents"; records: IncidentRecord[]; confidence: number; warnings: string[] }
  | { dataType: "chemicals"; records: ChemicalRecord[]; confidence: number; warnings: string[] }
  | { dataType: "training"; records: TrainingRecord[]; confidence: number; warnings: string[] }
  | { dataType: "maintenance"; records: MaintenanceRecord[]; confidence: number; warnings: string[] }
  | { dataType: "inspections"; records: InspectionRecord[]; confidence: number; warnings: string[] };

export async function extractDocumentData(rawContent: string, hint?: string): Promise<ExtractedRecords> {
  const contextHint = hint ? `\n\nDocument type hint: ${hint}` : "";

  const result = await generateStructuredOutput<ExtractedRecords>(
    DOCUMENT_EXTRACTION_PROMPT,
    `Document content:\n\n${rawContent}${contextHint}`,
    { temperature: 0.1, maxTokens: 4096 }
  );

  return result;
}

export function validateExtractedData(data: ExtractedRecords): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.dataType) {
    errors.push("Missing dataType field");
  }

  if (!Array.isArray(data.records)) {
    errors.push("Records must be an array");
  }

  if (data.records.length === 0) {
    errors.push("No records extracted from document");
  }

  if (data.confidence < 0.5) {
    errors.push(`Low extraction confidence: ${data.confidence}. Manual review recommended.`);
  }

  switch (data.dataType) {
    case "incidents":
      for (const [idx, record] of data.records.entries()) {
        if (!record.date) errors.push(`Incident record ${idx}: missing date`);
        if (!record.description) errors.push(`Incident record ${idx}: missing description`);
        if (!record.injuryType) errors.push(`Incident record ${idx}: missing injury type`);
      }
      break;
    case "chemicals":
      for (const [idx, record] of data.records.entries()) {
        if (!record.chemicalName) errors.push(`Chemical record ${idx}: missing chemical name`);
        if (!record.quantity && record.quantity !== 0) errors.push(`Chemical record ${idx}: missing quantity`);
      }
      break;
    case "training":
      for (const [idx, record] of data.records.entries()) {
        if (!record.employeeName) errors.push(`Training record ${idx}: missing employee name`);
        if (!record.course) errors.push(`Training record ${idx}: missing course`);
      }
      break;
    case "maintenance":
      for (const [idx, record] of data.records.entries()) {
        if (!record.equipmentName) errors.push(`Maintenance record ${idx}: missing equipment name`);
        if (!record.date) errors.push(`Maintenance record ${idx}: missing date`);
      }
      break;
    case "inspections":
      for (const [idx, record] of data.records.entries()) {
        if (!record.location) errors.push(`Inspection record ${idx}: missing location`);
        if (!record.description) errors.push(`Inspection record ${idx}: missing description`);
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}
