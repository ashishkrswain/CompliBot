"use client";

import { useState } from "react";
import { FileText, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { UploadZone } from "@/components/upload-zone";

const documentsData = [
  { id: "doc-1", filename: "incident_log_q1_2026.csv", mimeType: "text/csv", size: 45200, status: "extracted", project: "2026 OSHA 300 Annual Log", uploadedAt: "2026-04-01" },
  { id: "doc-2", filename: "incident_log_q2_2026.csv", mimeType: "text/csv", size: 38100, status: "extracted", project: "2026 OSHA 300 Annual Log", uploadedAt: "2026-07-05" },
  { id: "doc-3", filename: "chemical_inventory_2025.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 234000, status: "extracted", project: "EPA Tier II - 2025 Submission", uploadedAt: "2025-12-15" },
  { id: "doc-4", filename: "maintenance_records_may2026.pdf", mimeType: "application/pdf", size: 1250000, status: "processing", project: "Q2 Maintenance Compliance Audit", uploadedAt: "2026-05-10" },
  { id: "doc-5", filename: "safety_walkthrough_photos.zip", mimeType: "application/zip", size: 8500000, status: "uploaded", project: "Annual Safety Walkthrough", uploadedAt: "2026-02-20" },
  { id: "doc-6", filename: "hr_training_records.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 125000, status: "extracted", project: "2026 OSHA 300 Annual Log", uploadedAt: "2026-05-10" },
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documentsData.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async (files: File[]) => {
    // In production, this would call the API
    console.log("Uploading files:", files.map((f) => f.name));
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Upload and manage operational data for compliance report generation.</p>
      </div>

      {/* Upload Zone */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Upload Documents</h3>
        <UploadZone onUpload={handleUpload} />
      </Card>

      {/* Document List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">All Documents ({documentsData.length})</h3>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">File</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">Project</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">Size</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-gray-600">{doc.project}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-gray-500">{formatFileSize(doc.size)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
