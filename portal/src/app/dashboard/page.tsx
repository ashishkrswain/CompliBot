"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, AlertTriangle, TrendingUp, Calendar, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { AnalyticsOverview, ReportData } from "@/lib/api";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
    </div>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-gray-200 animate-pulse h-12 w-12" />
        <div className="space-y-2">
          <div className="h-6 w-12 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-gray-500";
  if (score >= 80) return "text-compliance-green";
  if (score >= 60) return "text-compliance-yellow";
  return "text-compliance-red";
}

export default function DashboardOverview() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const [overviewRes, reportsRes] = await Promise.all([
        api.getOverview(),
        api.getReports(),
      ]);

      if (overviewRes.error && reportsRes.error) {
        setError(overviewRes.error ?? "Failed to load dashboard data");
      }

      if (overviewRes.data) {
        setOverview(overviewRes.data.overview);
      }

      if (reportsRes.data) {
        setReports(reportsRes.data.reports.slice(0, 5));
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  if (error && !overview && reports.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">{error}</p>
            <p className="text-xs text-gray-400 mt-1">Make sure the API server is running on port 3105</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard</p>
        </div>
        <Link href="/dashboard/reports/new">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4 mr-2" />
            Generate New Report
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.totalReports ?? 0}
                </p>
                <p className="text-sm text-gray-500">Total Reports</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.avgComplianceScore ?? 0}%
                </p>
                <p className="text-sm text-gray-500">Avg Compliance Score</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.openGaps ?? 0}
                </p>
                <p className="text-sm text-gray-500">Open Gaps</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.reportsThisMonth ?? 0}
                </p>
                <p className="text-sm text-gray-500">Reports This Month</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Reports Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Reports</h3>
          <Link href="/dashboard/reports" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No reports yet</p>
            <Link href="/dashboard/reports/new" className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block">
              Generate your first report
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Title</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Type</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Score</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand-600"
                      >
                        {report.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="info">
                        {report.reportType.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-sm font-semibold ${getScoreColor(report.complianceScore)}`}>
                        {report.complianceScore !== null ? `${report.complianceScore}%` : "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3">
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
