"use client";

import { Shield, FileText, AlertTriangle, ClipboardCheck, Users, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ComplianceGauge } from "@/components/compliance-gauge";
import { DeadlineCard } from "@/components/deadline-card";
import { StatusBadge } from "@/components/ui/badge";
import Link from "next/link";

// Demo data — in production this would come from the API
const hipaaComplianceData = {
  overallScore: 72,
  administrativeSafeguards: 68,
  physicalSafeguards: 78,
  technicalSafeguards: 65,
  totalPolicies: 16,
  policiesImplemented: 11,
  openGaps: 9,
  criticalGaps: 2,
  lastSRADate: "2025-08-15",
  lastTrainingDate: "2025-11-01",
};

const reportTypes = [
  {
    id: "HIPAA_SRA",
    title: "Security Risk Assessment",
    description: "Complete SRA per 45 CFR 164.308(a)(1) covering all Administrative, Physical, and Technical Safeguards",
    icon: Shield,
    color: "blue",
    href: "/dashboard/healthcare/sra",
  },
  {
    id: "HIPAA_POLICIES",
    title: "Policies & Procedures",
    description: "Generate all 16 required HIPAA policies with proper citations and organization-specific content",
    icon: FileText,
    color: "green",
    href: "/dashboard/reports?type=HIPAA_POLICIES",
  },
  {
    id: "HIPAA_BREACH",
    title: "Breach Assessment",
    description: "4-factor risk assessment, breach determination, and notification documentation per 45 CFR 164.400-414",
    icon: AlertTriangle,
    color: "red",
    href: "/dashboard/healthcare/breach",
  },
  {
    id: "HIPAA_BAA",
    title: "Business Associate Agreement",
    description: "Complete BAA per 45 CFR 164.314(a) and 164.504(e) with all required Omnibus Rule provisions",
    icon: Scale,
    color: "purple",
    href: "/dashboard/reports?type=HIPAA_BAA",
  },
  {
    id: "BLOODBORNE",
    title: "Exposure Control Plan",
    description: "OSHA Bloodborne Pathogens Exposure Control Plan per 29 CFR 1910.1030",
    icon: ClipboardCheck,
    color: "orange",
    href: "/dashboard/reports?type=BLOODBORNE",
  },
  {
    id: "COMPLIANCE_PROGRAM",
    title: "OIG Compliance Program",
    description: "All 7 elements of an effective healthcare compliance program per OIG guidance",
    icon: Users,
    color: "indigo",
    href: "/dashboard/reports?type=COMPLIANCE_PROGRAM",
  },
];

const recentReports = [
  { id: "r1", title: "HIPAA SRA — Q1 2026", status: "approved", score: 72, date: "2026-03-15" },
  { id: "r2", title: "HIPAA Policies Package", status: "approved", score: 85, date: "2026-02-01" },
  { id: "r3", title: "Breach Assessment — Lost Laptop", status: "draft", score: 60, date: "2026-04-22" },
  { id: "r4", title: "BAA — Cloud EHR Vendor", status: "review", score: 90, date: "2026-05-01" },
];

const upcomingDeadlines = [
  { title: "Annual Security Risk Assessment", dueDate: "2026-08-15", standard: "45 CFR 164.308(a)(1)" },
  { title: "Workforce HIPAA Training Renewal", dueDate: "2026-11-01", standard: "45 CFR 164.308(a)(5)" },
  { title: "Contingency Plan Test", dueDate: "2026-06-30", standard: "45 CFR 164.308(a)(7)(ii)(D)" },
  { title: "BA Agreement Annual Review", dueDate: "2026-07-01", standard: "45 CFR 164.308(b)(1)" },
  { title: "Exposure Control Plan Annual Update", dueDate: "2026-09-01", standard: "29 CFR 1910.1030(c)(1)(iv)" },
];

const iconBgMap: Record<string, string> = {
  blue: "bg-blue-100",
  green: "bg-green-100",
  red: "bg-red-100",
  purple: "bg-purple-100",
  orange: "bg-orange-100",
  indigo: "bg-indigo-100",
};

const iconColorMap: Record<string, string> = {
  blue: "text-blue-700",
  green: "text-green-700",
  red: "text-red-700",
  purple: "text-purple-700",
  orange: "text-orange-700",
  indigo: "text-indigo-700",
};

export default function HealthcareDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Healthcare Compliance</h1>
        <p className="text-sm text-gray-500 mt-1">
          HIPAA Security Rule, Privacy Rule, and healthcare regulatory compliance management.
        </p>
      </div>

      {/* HIPAA Compliance Score + Safeguard Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center">
          <ComplianceGauge score={hipaaComplianceData.overallScore} size="lg" label="HIPAA Compliance" />
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Safeguard Compliance Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Administrative Safeguards (164.308)</span>
                <span className="text-sm font-semibold text-gray-900">{hipaaComplianceData.administrativeSafeguards}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${hipaaComplianceData.administrativeSafeguards}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Physical Safeguards (164.310)</span>
                <span className="text-sm font-semibold text-gray-900">{hipaaComplianceData.physicalSafeguards}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${hipaaComplianceData.physicalSafeguards}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Technical Safeguards (164.312)</span>
                <span className="text-sm font-semibold text-gray-900">{hipaaComplianceData.technicalSafeguards}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${hipaaComplianceData.technicalSafeguards}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{hipaaComplianceData.policiesImplemented}/{hipaaComplianceData.totalPolicies}</div>
              <div className="text-xs text-gray-500">Policies Implemented</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{hipaaComplianceData.openGaps}</div>
              <div className="text-xs text-gray-500">Open Gaps</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{hipaaComplianceData.criticalGaps}</div>
              <div className="text-xs text-gray-500">Critical Gaps</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/healthcare/sra">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-700" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Run HIPAA Assessment</p>
                <p className="text-xs text-blue-700">Full Security Risk Assessment</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/reports?type=HIPAA_POLICIES">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-700" />
              <div>
                <p className="text-sm font-semibold text-green-900">Generate Policies</p>
                <p className="text-xs text-green-700">Complete HIPAA Policy Package</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/healthcare/breach">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-700" />
              <div>
                <p className="text-sm font-semibold text-red-900">Report Breach</p>
                <p className="text-xs text-red-700">Breach Assessment & Notification</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Report Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Link key={report.id} href={report.href}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${iconBgMap[report.color]}`}>
                      <Icon className={`h-5 w-5 ${iconColorMap[report.color]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{report.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Reports + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Healthcare Reports */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Healthcare Reports</h3>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                  <p className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {report.score !== null && (
                    <span className="text-xs font-medium text-gray-600">{report.score}%</span>
                  )}
                  <StatusBadge status={report.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Compliance Deadlines</h3>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline, idx) => (
              <DeadlineCard
                key={idx}
                title={deadline.title}
                dueDate={deadline.dueDate}
                standard={deadline.standard}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
