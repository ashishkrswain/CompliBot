"use client";

import { ArrowLeft, FileText, AlertTriangle, Calendar, Upload } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ComplianceGauge } from "@/components/compliance-gauge";
import { GapCard } from "@/components/gap-card";

// Demo data for a specific project
const projectDetail = {
  id: "proj-1",
  name: "2026 OSHA 300 Annual Log",
  type: "OSHA_300",
  status: "in_progress",
  description: "Annual OSHA 300 Log compilation for Houston plant. Tracking all work-related injuries and illnesses for calendar year 2026.",
  dateRangeStart: "2026-01-01",
  dateRangeEnd: "2026-12-31",
  dueDate: "2027-02-01",
  complianceScore: 72,
};

const projectDocuments = [
  { id: "doc-1", filename: "incident_log_q1_2026.csv", status: "extracted", size: 45200, uploadedAt: "2026-04-01" },
  { id: "doc-2", filename: "incident_log_q2_2026.csv", status: "extracted", size: 38100, uploadedAt: "2026-07-05" },
  { id: "doc-3", filename: "hr_training_records.xlsx", status: "processing", size: 125000, uploadedAt: "2026-05-10" },
];

const projectReports = [
  { id: "rpt-1", title: "OSHA 300 Log - Q1 2026", status: "approved", score: 85, createdAt: "2026-04-15" },
  { id: "rpt-2", title: "OSHA 300 Log - H1 2026", status: "draft", score: 72, createdAt: "2026-07-10" },
];

const projectGaps = [
  {
    id: "gap-1",
    standard: "29 CFR 1904.7",
    requirement: "Record all work-related injuries resulting in days away from work within 7 calendar days",
    currentState: "3 incidents from Q2 were recorded 12-15 days after occurrence",
    severity: "high",
    recommendedAction: "Implement automated incident notification system with 48-hour recording reminder escalation",
    resolved: false,
    deadline: "2026-08-01",
  },
  {
    id: "gap-2",
    standard: "29 CFR 1904.29",
    requirement: "Maintain OSHA 300 Log with complete and accurate entries for all recordable cases",
    currentState: "Log entries missing employee department for 5 cases; 2 cases lack injury classification",
    severity: "medium",
    recommendedAction: "Audit all current year entries for completeness; update intake form to require all OSHA fields",
    resolved: false,
    deadline: null,
  },
  {
    id: "gap-3",
    standard: "29 CFR 1910.147",
    requirement: "Annual inspection of energy control procedures by authorized employee",
    currentState: "Last LOTO procedure audit was 14 months ago; 2 new machines added without procedures",
    severity: "critical",
    recommendedAction: "Immediately schedule LOTO audit; develop energy control procedures for new CNC machines before next shift operation",
    resolved: false,
    deadline: "2026-06-01",
  },
];

export default function ProjectDetailPage() {
  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{projectDetail.name}</h1>
              <StatusBadge status={projectDetail.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{projectDetail.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {projectDetail.dateRangeStart} to {projectDetail.dateRangeEnd}
              </span>
              <span>Due: {new Date(projectDetail.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
          <Button variant="primary">Generate Report</Button>
        </div>
      </div>

      {/* Score + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center">
          <ComplianceGauge score={projectDetail.complianceScore} size="md" label="Project Compliance" />
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Project Timeline</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600 whitespace-nowrap">Created (Jan 15)</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-200 min-w-8" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600 whitespace-nowrap">Q1 Data Uploaded</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-200 min-w-8" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600 whitespace-nowrap">Q1 Report Generated</span>
            </div>
            <div className="flex-1 h-0.5 bg-blue-200 min-w-8" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-gray-600 whitespace-nowrap">H1 Report (Current)</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 min-w-8" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-600 whitespace-nowrap">Annual Summary (Feb 1)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Documents + Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Uploaded Documents</h3>
            <Button variant="ghost" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
          </div>
          <div className="space-y-2">
            {projectDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <FileText className="h-4 w-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Reports */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Generated Reports</h3>
          </div>
          <div className="space-y-2">
            {projectReports.map((report) => (
              <Link key={report.id} href={`/dashboard/reports/${report.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <FileText className="h-4 w-4 text-brand-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                    <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.score && <span className="text-xs font-medium text-gray-600">{report.score}%</span>}
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance Gaps */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Compliance Gaps ({projectGaps.length})
        </h3>
        <div className="space-y-3">
          {projectGaps.map((gap) => (
            <GapCard key={gap.id} gap={gap} />
          ))}
        </div>
      </div>
    </div>
  );
}
