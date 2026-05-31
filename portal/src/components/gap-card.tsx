"use client";

import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";
import type { GapData } from "@/lib/api";

interface GapCardProps {
  gap: GapData;
  showActions?: boolean;
}

export function GapCard({ gap, showActions = true }: GapCardProps) {
  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      bg: "bg-red-50",
      border: "border-red-200",
      iconColor: "text-red-600",
      badge: "bg-red-100 text-red-800",
      label: "Critical",
    },
    high: {
      icon: AlertTriangle,
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconColor: "text-orange-600",
      badge: "bg-orange-100 text-orange-800",
      label: "High",
    },
    medium: {
      icon: AlertCircle,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      iconColor: "text-yellow-600",
      badge: "bg-yellow-100 text-yellow-800",
      label: "Medium",
    },
    low: {
      icon: Info,
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconColor: "text-blue-600",
      badge: "bg-blue-100 text-blue-800",
      label: "Low",
    },
    informational: {
      icon: Info,
      bg: "bg-gray-50",
      border: "border-gray-200",
      iconColor: "text-gray-600",
      badge: "bg-gray-100 text-gray-800",
      label: "Info",
    },
  };

  const config = severityConfig[gap.severity as keyof typeof severityConfig] ?? severityConfig.medium;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.badge}`}>
              {config.label}
            </span>
            <span className="text-xs font-mono text-gray-500">{gap.standard}</span>
          </div>

          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {gap.requirement}
          </h4>

          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Current state:</span> {gap.currentState}
          </p>

          {showActions && (
            <div className="bg-white/70 rounded-md p-3 border border-gray-200/50">
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">Recommended Action</span>
                  <p className="text-sm text-gray-700 mt-0.5">{gap.recommendedAction}</p>
                </div>
              </div>
            </div>
          )}

          {gap.deadline && (
            <div className="mt-2 text-xs text-gray-500">
              Deadline: {new Date(gap.deadline).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
