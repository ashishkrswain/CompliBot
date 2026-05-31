"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FolderOpen, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

// Demo data
const projectsData = [
  {
    id: "proj-1",
    name: "2026 OSHA 300 Annual Log",
    type: "OSHA_300",
    status: "in_progress",
    description: "Annual OSHA 300 Log compilation for Houston plant",
    dueDate: "2027-02-01",
    createdAt: "2026-01-15",
    reportCount: 2,
    gapCount: 3,
  },
  {
    id: "proj-2",
    name: "EPA Tier II - 2025 Submission",
    type: "EPA_TIER2",
    status: "review",
    description: "Annual Tier II hazardous chemical inventory report",
    dueDate: "2026-03-01",
    createdAt: "2025-12-01",
    reportCount: 1,
    gapCount: 2,
  },
  {
    id: "proj-3",
    name: "Q2 Maintenance Compliance Audit",
    type: "MAINTENANCE_AUDIT",
    status: "draft",
    description: "Quarterly maintenance compliance audit covering LOTO, cranes, and pressure vessels",
    dueDate: "2026-07-15",
    createdAt: "2026-04-01",
    reportCount: 0,
    gapCount: 0,
  },
  {
    id: "proj-4",
    name: "Annual Safety Walkthrough",
    type: "SAFETY_INSPECTION",
    status: "complete",
    description: "Annual comprehensive safety inspection for insurance and OSHA compliance",
    dueDate: "2026-03-30",
    createdAt: "2026-02-15",
    reportCount: 1,
    gapCount: 5,
  },
];

const typeLabels: Record<string, string> = {
  OSHA_300: "OSHA 300 Log",
  EPA_TIER2: "EPA Tier II",
  MAINTENANCE_AUDIT: "Maintenance Audit",
  SAFETY_INSPECTION: "Safety Inspection",
};

const typeColors: Record<string, string> = {
  OSHA_300: "bg-blue-100 text-blue-800",
  EPA_TIER2: "bg-green-100 text-green-800",
  MAINTENANCE_AUDIT: "bg-orange-100 text-orange-800",
  SAFETY_INSPECTION: "bg-red-100 text-red-800",
};

export default function ProjectsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredProjects = filterStatus === "all"
    ? projectsData
    : projectsData.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your compliance projects and track progress.</p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "draft", "in_progress", "review", "complete"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              filterStatus === status
                ? "bg-brand-100 text-brand-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Project List */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[project.type]}`}>
                        {typeLabels[project.type]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                      <span>{project.reportCount} report{project.reportCount !== 1 ? "s" : ""}</span>
                      <span>{project.gapCount} gap{project.gapCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
