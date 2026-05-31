"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ComplianceGauge } from "@/components/compliance-gauge";
import { ReportViewer } from "@/components/report-viewer";
import { GapCard } from "@/components/gap-card";
import { api } from "@/lib/api";
import type { ReportData, ReportSectionData, GapData } from "@/lib/api";

const API_BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3105";

const typeLabels: Record<string, string> = {
  OSHA_300: "OSHA 300",
  OSHA_300A: "OSHA 300A",
  OSHA_301: "OSHA 301",
  EPA_TIER2: "EPA Tier II",
  EPA_TRI: "EPA TRI",
  MAINTENANCE_AUDIT: "Maintenance Audit",
  SAFETY_INSPECTION: "Safety Inspection",
  LOTO_AUDIT: "LOTO Audit",
  PSM_AUDIT: "PSM Audit",
  HIPAA_SRA: "HIPAA SRA",
  HIPAA_BREACH: "HIPAA Breach",
  HIPAA_BAA: "HIPAA BAA",
  JOINT_COMMISSION: "Joint Commission",
  BSA_CTR: "BSA CTR",
  BSA_SAR: "BSA SAR",
  CRA_REPORT: "CRA Compliance",
  FFIEC_CAT: "FFIEC Cybersecurity",
  SOC2_TYPE2: "SOC 2 Type II",
  GDPR_DPIA: "GDPR DPIA",
  NIST_CSF: "NIST CSF",
  FEDRAMP: "FedRAMP",
  ISO_27001: "ISO 27001",
  PCI_DSS: "PCI DSS",
  EMERGENCY_ACTION_PLAN: "Emergency Action Plan",
  FIRE_PREVENTION: "Fire Prevention",
  HAZCOM_PROGRAM: "HazCom Program",
};

function getTypeBadgeVariant(reportType: string): "default" | "success" | "warning" | "danger" | "info" {
  if (reportType.startsWith("OSHA") || reportType.startsWith("EPA")) return "info";
  if (reportType.startsWith("HIPAA") || reportType.startsWith("JOINT")) return "success";
  if (reportType.startsWith("BSA") || reportType.startsWith("CRA") || reportType.startsWith("FFIEC")) return "warning";
  if (reportType.startsWith("SAFETY") || reportType.startsWith("EMERGENCY") || reportType.startsWith("FIRE")) return "danger";
  return "info";
}

function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-7 w-96 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="h-48 bg-gray-200 animate-pulse rounded-xl" />
        <div className="lg:col-span-3 h-48 bg-gray-200 animate-pulse rounded-xl" />
      </div>
      <div className="h-96 bg-gray-200 animate-pulse rounded-xl" />
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [sections, setSections] = useState<ReportSectionData[]>([]);
  const [gaps, setGaps] = useState<GapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);

      const res = await api.getReport(reportId);

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setReport(res.data.report);
        setSections(res.data.sections);
        setGaps(res.data.gaps);
      }

      setLoading(false);
    }

    fetchReport();
  }, [reportId]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Failed to load report</p>
            <p className="text-xs text-gray-500 mt-1">{error ?? "Report not found"}</p>
          </div>
        </Card>
      </div>
    );
  }

  const pdfUrl = `${API_BASE}/api/reports/${reportId}/pdf`;

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
              <Badge variant={getTypeBadgeVariant(report.reportType)}>
                {typeLabels[report.reportType] ?? report.reportType.replace(/_/g, " ")}
              </Badge>
              <StatusBadge status={report.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Generated: {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </a>
            <Button variant="secondary" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Revise
            </Button>
            <Button variant="primary" size="sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center">
          {report.complianceScore !== null ? (
            <ComplianceGauge score={report.complianceScore} size="md" label="Report Score" />
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 text-gray-300 animate-spin mb-2" />
              <span className="text-xs text-gray-400">Calculating...</span>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Executive Summary</h3>
          {report.summary ? (
            <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No summary available yet.</p>
          )}
        </Card>
      </div>

      {/* Report Content */}
      {sections.length > 0 && (
        <Card>
          <ReportViewer sections={sections} title={report.title} summary={report.summary} />
        </Card>
      )}

      {/* Compliance Gaps */}
      {gaps.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Compliance Gaps Identified ({gaps.length})
          </h2>
          <div className="space-y-3">
            {gaps.map((gap) => (
              <GapCard key={gap.id} gap={gap} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for sections */}
      {sections.length === 0 && report.status === "generating" && (
        <Card>
          <div className="text-center py-12">
            <Loader2 className="h-10 w-10 text-brand-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900">Report is being generated</h3>
            <p className="text-sm text-gray-500 mt-2">
              AI is analyzing your data and writing the report. This page will update when complete.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
