"use client";

interface ComplianceGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ComplianceGauge({ score, size = "md", label }: ComplianceGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  const dimensions = {
    sm: { width: 100, stroke: 8, fontSize: "text-lg" },
    md: { width: 160, stroke: 12, fontSize: "text-3xl" },
    lg: { width: 220, stroke: 16, fontSize: "text-4xl" },
  };

  const { width, stroke, fontSize } = dimensions[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (value: number): string => {
    if (value >= 80) return "#10b981"; // green
    if (value >= 60) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const getLabel = (value: number): string => {
    if (value >= 90) return "Excellent";
    if (value >= 80) return "Good";
    if (value >= 60) return "Fair";
    if (value >= 40) return "Poor";
    return "Critical";
  };

  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold`} style={{ color }}>
            {clampedScore}
          </span>
          <span className="text-xs text-gray-500 font-medium">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium" style={{ color }}>
          {getLabel(clampedScore)}
        </div>
        {label && <div className="text-xs text-gray-500 mt-0.5">{label}</div>}
      </div>
    </div>
  );
}
