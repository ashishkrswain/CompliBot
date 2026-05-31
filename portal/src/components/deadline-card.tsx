"use client";

import { Calendar, Clock, AlertTriangle } from "lucide-react";

interface DeadlineCardProps {
  title: string;
  dueDate: string;
  standard: string;
  projectId?: string;
}

export function DeadlineCard({ title, dueDate, standard }: DeadlineCardProps) {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isUrgent = diffDays >= 0 && diffDays <= 7;
  const isSoon = diffDays > 7 && diffDays <= 30;

  const statusColor = isOverdue
    ? "border-red-200 bg-red-50"
    : isUrgent
      ? "border-orange-200 bg-orange-50"
      : isSoon
        ? "border-yellow-200 bg-yellow-50"
        : "border-gray-200 bg-white";

  const textColor = isOverdue
    ? "text-red-700"
    : isUrgent
      ? "text-orange-700"
      : isSoon
        ? "text-yellow-700"
        : "text-gray-700";

  const formatCountdown = (): string => {
    if (isOverdue) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days remaining`;
  };

  return (
    <div className={`rounded-lg border ${statusColor} p-4`}>
      <div className="flex items-start gap-3">
        {isOverdue || isUrgent ? (
          <AlertTriangle className={`h-5 w-5 ${isOverdue ? "text-red-500" : "text-orange-500"} flex-shrink-0`} />
        ) : (
          <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{standard}</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className={`h-3.5 w-3.5 ${textColor}`} />
            <span className={`text-sm font-medium ${textColor}`}>
              {formatCountdown()}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Due: {due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}
