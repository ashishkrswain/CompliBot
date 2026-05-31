"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ReportData } from "@/lib/api";

const typeColors: Record<string, { variant: "default" | "success" | "warning" | "danger" | "info"; label: string }> = {
  OSHA_300: { variant: "info", label: "OSHA 300" },
  EPA_TIER2: { variant: "success", label: "EPA Tier II" },
  MAINTENANCE_AUDIT: { variant: "warning", label: "Maintenance Audit" },
  SAFETY_INSPECTION: { variant: "danger", label: "Safety Inspection" },
  HIPAA_SRA: { variant: "info", label: "HIPAA SRA" },
  HIPAA_BREACH: { variant: "danger", label: "HIPAA Breach" },
  BSA_CTR: { variant: "warning", label: "BSA CTR" },
  BSA_SAR: { variant: "danger", label: "BSA SAR" },
  SOC2_TYPE2: { variant: "info", label: "SOC 2 Type II" },
  GDPR_DPIA: { variant: "success", label: "GDPR DPIA" },
  NIST_CSF: { variant: "info", label: "NIST CSF" },
  FEDRAMP: { variant: "success", label: "FedRAMP" },
  ISO_27001: { variant: "info", label: "ISO 27001" },
  PCI_DSS: { variant: "warning", label: "PCI DSS" },
  EMERGENCY_ACTION_PLAN: { variant: "danger", label: "Emergency Action Plan" },
};

function getScoreColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 80) return "text-compliance-green";
  if (score >= 60) return "text-compliance-yellow";
  return "text-compliance-red";
}

function getScoreBg(score: number | null): string {
  if (score === null) return "bg-gray-100";
  if (score >= 80) return "bg-green-50";
  if (score >= 60) return "bg-yellow-50";
  return "bg-red-50";
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="h-4 w-64 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const res = await api.getReports();
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setReports(res.data.reports);
      }
      setLoading(false);
    }

    fetchReports();
  }, []);

  function getTypeBadge(reportType: string) {
    const config = typeColors[reportType];
    if (config) {
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
    return <Badge variant="default">{reportType.replace(/_/g, " ")}</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            View, download, and manage all generated compliance reports.
          </p>
        </div>
        <Link href="/dashboard/reports/new">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4 mr-2" />
            Generate New Report
          </Button>
        </Link>
      </div>

      {/* Reports Table */}
      <Card>
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">No reports generated yet</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Start by generating your first compliance report
            </p>
            <Link href="/dashboard/reports/new">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Generate Report
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                    Score
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 pr-4">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand-600 transition-colors"
                      >
                        {report.title}
                      </Link>
                    </td>
                    <td className="py-4 pr-4">
                      {getTypeBadge(report.reportType)}
                    </td>
                    <td className="py-4 pr-4">
                      {report.complianceScore !== null ? (
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-sm font-bold ${getScoreColor(report.complianceScore)} ${getScoreBg(report.complianceScore)}`}
                        >
                          {report.complianceScore}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
