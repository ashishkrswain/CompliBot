"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  AlertTriangle,
  Building2,
  Globe,
  Server,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface ReportCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  regulation: string;
  status: "available" | "coming-soon";
}

const reportCards: ReportCard[] = [
  {
    title: "BSA/AML Risk Assessment",
    description: "Comprehensive BSA/AML/OFAC risk assessment per FFIEC BSA/AML Manual methodology",
    href: "/dashboard/banking/bsa",
    icon: Shield,
    regulation: "31 CFR 1010.210",
    status: "available",
  },
  {
    title: "BSA Compliance Program",
    description: "Complete BSA program manual with all four regulatory pillars, CIP, CDD, EDD, and SAR/CTR procedures",
    href: "/dashboard/banking/bsa-program",
    icon: FileText,
    regulation: "12 CFR 21.21",
    status: "available",
  },
  {
    title: "SAR Narrative Generator",
    description: "Filing-ready SAR narratives per FinCEN quality standards with 5 Ws structure",
    href: "/dashboard/banking/sar",
    icon: AlertTriangle,
    regulation: "31 CFR 1010.320",
    status: "available",
  },
  {
    title: "CRA Self-Assessment",
    description: "Community Reinvestment Act assessment with lending, investment, and service test analysis",
    href: "/dashboard/banking/cra",
    icon: Building2,
    regulation: "12 CFR 25/228/345",
    status: "available",
  },
  {
    title: "FFIEC Cybersecurity Assessment",
    description: "FFIEC CAT assessment with inherent risk profile, maturity domains, and gap analysis",
    href: "/dashboard/banking/ffiec-cyber",
    icon: Globe,
    regulation: "FFIEC CAT",
    status: "available",
  },
  {
    title: "Vendor Risk Management",
    description: "Third-party risk assessment per OCC Bulletin 2013-29 with due diligence and monitoring",
    href: "/dashboard/banking/vendor-risk",
    icon: Server,
    regulation: "OCC 2013-29",
    status: "available",
  },
];

const complianceStatus = {
  bsaProgram: { score: 82, status: "satisfactory" as const },
  sarFiling: { pendingCount: 2, overdueCount: 0 },
  ctrFiling: { currentMonth: 47, priorMonth: 52 },
  ofac: { lastScreenUpdate: "2026-05-18", alertsPending: 3 },
  examReadiness: 76,
};

const upcomingDeadlines = [
  { date: "2026-06-01", task: "SAR Continuing Activity Filing — Account #4521", regulation: "31 CFR 1010.320", priority: "high" as const },
  { date: "2026-06-15", task: "CTR Exemption Renewal — Phase II Customers", regulation: "31 CFR 1010.311", priority: "medium" as const },
  { date: "2026-07-01", task: "Quarterly OFAC Screening Validation", regulation: "31 CFR Part 501", priority: "medium" as const },
  { date: "2026-09-30", task: "OFAC Blocked Property Annual Report", regulation: "31 CFR 501.603", priority: "high" as const },
  { date: "2026-10-01", task: "BSA/AML Risk Assessment Annual Update", regulation: "31 CFR 1010.210", priority: "high" as const },
  { date: "2027-03-01", task: "CRA Data Submission (HMDA/CRA)", regulation: "12 CFR 25", priority: "high" as const },
];

export default function BankingDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banking Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">
            BSA/AML, CRA, FFIEC Cybersecurity, and Third-Party Risk Management
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <Shield className="h-3.5 w-3.5 mr-1.5" />
          Exam Readiness: {complianceStatus.examReadiness}%
        </Badge>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">BSA Program</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{complianceStatus.bsaProgram.score}%</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium mt-2">Satisfactory</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending SARs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{complianceStatus.sarFiling.pendingCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 font-medium mt-2">{complianceStatus.sarFiling.overdueCount} overdue</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">CTRs This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{complianceStatus.ctrFiling.currentMonth}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">Prior month: {complianceStatus.ctrFiling.priorMonth}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">OFAC Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{complianceStatus.ofac.alertsPending}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">List updated: {complianceStatus.ofac.lastScreenUpdate}</p>
        </Card>
      </div>

      {/* Report Types Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="p-5 h-full hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-600" />
                    </div>
                    {card.status === "available" ? (
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                    ) : (
                      <Badge variant="outline" className="text-xs">Soon</Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mt-3">{card.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs font-mono">{card.regulation}</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h3>
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {upcomingDeadlines.map((deadline, idx) => (
            <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <div className="flex-shrink-0">
                <Clock className={`h-4 w-4 ${deadline.priority === "high" ? "text-red-500" : "text-yellow-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{deadline.task}</p>
                <p className="text-xs text-gray-500">{deadline.regulation}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {deadline.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/dashboard/banking/sar">
            <Card className="p-4 hover:border-brand-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">File New SAR</p>
                  <p className="text-xs text-gray-500">Generate filing-ready narrative</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/banking/bsa">
            <Card className="p-4 hover:border-brand-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Update Risk Assessment</p>
                  <p className="text-xs text-gray-500">Annual BSA/AML refresh</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/banking/ffiec-cyber">
            <Card className="p-4 hover:border-brand-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cyber Assessment</p>
                  <p className="text-xs text-gray-500">FFIEC CAT evaluation</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
