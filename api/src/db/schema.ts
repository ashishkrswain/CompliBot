import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, pgEnum, decimal } from "drizzle-orm/pg-core";

export const projectTypeEnum = pgEnum("project_type", [
  "OSHA_300",
  "EPA_TIER2",
  "MAINTENANCE_AUDIT",
  "SAFETY_INSPECTION",
  "HIPAA_SRA",
  "HIPAA_POLICIES",
  "HIPAA_BREACH",
  "HIPAA_BAA",
  "BLOODBORNE",
  "COMPLIANCE_PROGRAM",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "in_progress",
  "review",
  "complete",
  "archived",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "generating",
  "draft",
  "failed",
  "review",
  "approved",
  "revision_requested",
  "final",
]);

export const gapSeverityEnum = pgEnum("gap_severity", [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "uploaded",
  "processing",
  "extracted",
  "failed",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  industry: text("industry"),
  size: text("size"),
  locations: integer("locations").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  facilityType: text("facility_type"),
  employeeCount: integer("employee_count"),
  naicsCode: text("naics_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  facilityId: uuid("facility_id").references(() => facilities.id),
  name: text("name").notNull(),
  type: projectTypeEnum("type").notNull(),
  status: projectStatusEnum("status").notNull().default("draft"),
  description: text("description"),
  dateRangeStart: timestamp("date_range_start"),
  dateRangeEnd: timestamp("date_range_end"),
  dueDate: timestamp("due_date"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").references(() => projects.id),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  status: documentStatusEnum("status").notNull().default("uploaded"),
  rawContent: text("raw_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const extractedData = pgTable("extracted_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id),
  dataType: text("data_type").notNull(),
  structured: jsonb("structured").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  facilityId: uuid("facility_id").references(() => facilities.id),
  reportType: projectTypeEnum("report_type").notNull(),
  title: text("title").notNull(),
  status: reportStatusEnum("status").notNull().default("generating"),
  dateRangeStart: timestamp("date_range_start"),
  dateRangeEnd: timestamp("date_range_end"),
  summary: text("summary"),
  complianceScore: integer("compliance_score"),
  metadata: jsonb("metadata"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reportSections = pgTable("report_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => reports.id),
  sectionOrder: integer("section_order").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations"),
  findings: jsonb("findings"),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceGaps = pgTable("compliance_gaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").references(() => projects.id),
  reportId: uuid("report_id").references(() => reports.id),
  facilityId: uuid("facility_id").references(() => facilities.id),
  standard: text("standard").notNull(),
  requirement: text("requirement").notNull(),
  currentState: text("current_state").notNull(),
  severity: gapSeverityEnum("severity").notNull(),
  recommendedAction: text("recommended_action").notNull(),
  deadline: timestamp("deadline"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const regulatoryRequirements = pgTable("regulatory_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  standard: text("standard").notNull(),
  section: text("section").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  applicability: text("applicability"),
  frequency: text("frequency"),
  penalties: text("penalties"),
  metadata: jsonb("metadata"),
});

export type Organization = typeof organizations.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ExtractedData = typeof extractedData.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type ReportSection = typeof reportSections.$inferSelect;
export type ComplianceGap = typeof complianceGaps.$inferSelect;
export type RegulatoryRequirement = typeof regulatoryRequirements.$inferSelect;
