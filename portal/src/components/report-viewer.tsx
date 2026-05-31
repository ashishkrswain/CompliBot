"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, AlertTriangle, Lightbulb } from "lucide-react";
import type { ReportSectionData } from "@/lib/api";

interface ReportViewerProps {
  sections: ReportSectionData[];
  title: string;
  summary: string | null;
}

export function ReportViewer({ sections, title, summary }: ReportViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedSections(next);
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {summary && (
          <p className="mt-3 text-gray-600 leading-relaxed">{summary}</p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const citations = Array.isArray(section.citations) ? section.citations : [];
          const findings = Array.isArray(section.findings) ? section.findings : [];
          const recommendations = Array.isArray(section.recommendations) ? section.recommendations : [];

          return (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-500 w-8">
                  {section.sectionOrder}.
                </span>
                <span className="font-semibold text-gray-900">{section.title}</span>
                <div className="ml-auto flex items-center gap-2">
                  {citations.length > 0 && (
                    <span className="badge-blue">{citations.length} citations</span>
                  )}
                  {findings.length > 0 && (
                    <span className="badge-yellow">{findings.length} findings</span>
                  )}
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-5 py-4 space-y-4">
                  {/* Main content */}
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {section.content}
                  </div>

                  {/* Citations */}
                  {citations.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">Regulatory Citations</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {citations.map((citation, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {String(citation)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Findings */}
                  {findings.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-900">Findings</span>
                      </div>
                      <ul className="space-y-1">
                        {findings.map((finding, idx) => (
                          <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                            {String(finding)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">Recommendations</span>
                      </div>
                      <ul className="space-y-1">
                        {recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                            {String(rec)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
