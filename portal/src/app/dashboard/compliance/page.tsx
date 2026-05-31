"use client";

import { Card } from "@/components/ui/card";
import { ComplianceGauge } from "@/components/compliance-gauge";
import { GapCard } from "@/components/gap-card";
import { Badge } from "@/components/ui/badge";

// Demo data
const complianceScores = [
  { standard: "OSHA Recordkeeping (29 CFR 1904)", score: 72, gapCount: 2 },
  { standard: "LOTO (29 CFR 1910.147)", score: 55, gapCount: 1 },
  { standard: "EPA Tier II (40 CFR 370)", score: 78, gapCount: 2 },
  { standard: "Respiratory Protection (29 CFR 1910.134)", score: 90, gapCount: 0 },
  { standard: "PPE (29 CFR 1910.132)", score: 95, gapCount: 0 },
  { standard: "Fire Protection (NFPA 25)", score: 82, gapCount: 1 },
];

const allGaps = [
  {
    id: "g1",
    standard: "29 CFR 1910.147",
    requirement: "Annual inspection of energy control procedures by authorized employee",
    currentState: "Last LOTO procedure audit was 14 months ago; 2 new machines added without procedures",
    severity: "critical",
    recommendedAction: "Immediately schedule LOTO audit; develop energy control procedures for new CNC machines before next shift operation",
    resolved: false,
    deadline: "2026-06-01",
  },
  {
    id: "g2",
    standard: "29 CFR 1904.7",
    requirement: "Record all work-related injuries within 7 calendar days of receiving information",
    currentState: "3 incidents from Q2 were recorded 12-15 days after occurrence",
    severity: "high",
    recommendedAction: "Implement automated incident notification system with 48-hour recording reminder escalation",
    resolved: false,
    deadline: "2026-08-01",
  },
  {
    id: "g3",
    standard: "40 CFR 370.40",
    requirement: "Report specific storage locations within the facility for all Tier II chemicals",
    currentState: "4 chemicals have generic 'Main Facility' as storage location instead of specific building/area",
    severity: "medium",
    recommendedAction: "Conduct physical inventory walk-through to document precise storage locations (building ID, room, rack designation)",
    resolved: false,
    deadline: null,
  },
  {
    id: "g4",
    standard: "29 CFR 1904.29",
    requirement: "OSHA 300 Log entries must include all required information fields",
    currentState: "5 entries missing employee department; 2 entries missing injury classification",
    severity: "medium",
    recommendedAction: "Audit all current year entries for completeness; update intake form to require all OSHA fields",
    resolved: false,
    deadline: null,
  },
  {
    id: "g5",
    standard: "40 CFR 370.20",
    requirement: "Verify EHS status of all chemicals between 500-10,000 lbs against EPA EHS list",
    currentState: "3 chemicals in 500-10,000 lb range not verified against 40 CFR 355 Appendix A",
    severity: "medium",
    recommendedAction: "Cross-reference chemical inventory against EPA EHS list to confirm reporting thresholds",
    resolved: false,
    deadline: "2026-09-01",
  },
  {
    id: "g6",
    standard: "NFPA 25",
    requirement: "Quarterly flow tests for sprinkler systems",
    currentState: "Q1 2026 flow test documentation not found in records",
    severity: "low",
    recommendedAction: "Verify with fire protection contractor whether Q1 test was performed; schedule if missed",
    resolved: false,
    deadline: null,
  },
];

export default function CompliancePage() {
  const overallScore = Math.round(
    complianceScores.reduce((sum, s) => sum + s.score, 0) / complianceScores.length
  );

  const criticalCount = allGaps.filter((g) => g.severity === "critical").length;
  const highCount = allGaps.filter((g) => g.severity === "high").length;
  const mediumCount = allGaps.filter((g) => g.severity === "medium").length;
  const lowCount = allGaps.filter((g) => g.severity === "low").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Status</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time compliance scorecard across all applicable standards.</p>
      </div>

      {/* Overall Score + Gap Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center">
          <ComplianceGauge score={overallScore} size="lg" label="Overall Compliance" />
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Gap Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
              <div className="text-xs font-medium text-red-600 mt-1">Critical</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{highCount}</div>
              <div className="text-xs font-medium text-orange-600 mt-1">High</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{mediumCount}</div>
              <div className="text-xs font-medium text-yellow-600 mt-1">Medium</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{lowCount}</div>
              <div className="text-xs font-medium text-blue-600 mt-1">Low</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Per-Standard Scores */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Compliance by Standard</h3>
        <div className="space-y-3">
          {complianceScores.map((item, idx) => {
            const barColor = item.score >= 80 ? "bg-green-500" : item.score >= 60 ? "bg-yellow-500" : "bg-red-500";
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-72 text-sm font-medium text-gray-700 truncate">{item.standard}</div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${item.score}%` }} />
                </div>
                <div className="w-12 text-right text-sm font-semibold text-gray-900">{item.score}%</div>
                {item.gapCount > 0 && (
                  <Badge variant={item.score < 60 ? "danger" : "warning"}>{item.gapCount} gap{item.gapCount !== 1 ? "s" : ""}</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* All Gaps */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Open Gaps ({allGaps.length})</h2>
        <div className="space-y-3">
          {allGaps.map((gap) => (
            <GapCard key={gap.id} gap={gap} />
          ))}
        </div>
      </div>
    </div>
  );
}
