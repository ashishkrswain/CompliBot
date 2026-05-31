"use client";

import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    draft: { variant: "default", label: "Draft" },
    in_progress: { variant: "info", label: "In Progress" },
    review: { variant: "warning", label: "Review" },
    complete: { variant: "success", label: "Complete" },
    archived: { variant: "default", label: "Archived" },
    generating: { variant: "info", label: "Generating" },
    approved: { variant: "success", label: "Approved" },
    revision_requested: { variant: "warning", label: "Revision Requested" },
    final: { variant: "success", label: "Final" },
    uploaded: { variant: "default", label: "Uploaded" },
    processing: { variant: "info", label: "Processing" },
    extracted: { variant: "success", label: "Extracted" },
    failed: { variant: "danger", label: "Failed" },
  };

  const config = statusMap[status] ?? { variant: "default" as const, label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
