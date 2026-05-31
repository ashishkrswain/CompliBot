"use client";

import { clsx } from "clsx";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "brand" | "green" | "yellow" | "red";
  showLabel?: boolean;
}

export function Progress({ value, max = 100, size = "md", color = "brand", showLabel = false }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colors = {
    brand: "bg-brand-600",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="w-full">
      <div className={clsx("w-full bg-gray-100 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={clsx("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{value}</span>
          <span className="text-xs text-gray-500">{max}</span>
        </div>
      )}
    </div>
  );
}
