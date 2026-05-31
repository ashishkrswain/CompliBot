import type { ComplianceGapResult, StandardAssessment } from "./compliance-checker.js";

export interface GapAnalysisReport {
  facilityId: string;
  analysisDate: string;
  overallRiskLevel: "critical" | "high" | "medium" | "low";
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  lowGaps: number;
  estimatedRemediationCost: CostEstimate;
  prioritizedActions: PrioritizedAction[];
  complianceTimeline: TimelineItem[];
}

export interface CostEstimate {
  minimum: number;
  maximum: number;
  currency: string;
  breakdown: Array<{ category: string; min: number; max: number }>;
}

export interface PrioritizedAction {
  priority: number;
  gap: ComplianceGapResult;
  standard: string;
  estimatedEffort: string;
  deadline: string;
  responsibleParty: string;
}

export interface TimelineItem {
  date: string;
  milestone: string;
  gaps: string[];
  status: "overdue" | "due_soon" | "on_track" | "future";
}

export function analyzeGaps(
  assessments: StandardAssessment[],
  facilityId: string
): GapAnalysisReport {
  const allGaps: Array<{ gap: ComplianceGapResult; standard: string }> = [];

  for (const assessment of assessments) {
    if (!assessment.applicable) continue;
    for (const gap of assessment.gaps) {
      allGaps.push({ gap, standard: assessment.standard });
    }
  }

  const criticalGaps = allGaps.filter((g) => g.gap.severity === "critical").length;
  const highGaps = allGaps.filter((g) => g.gap.severity === "high").length;
  const mediumGaps = allGaps.filter((g) => g.gap.severity === "medium").length;
  const lowGaps = allGaps.filter((g) => g.gap.severity === "low").length;

  const overallRiskLevel = determineRiskLevel(criticalGaps, highGaps, mediumGaps);
  const estimatedRemediationCost = estimateCosts(allGaps);
  const prioritizedActions = buildPrioritizedActions(allGaps);
  const complianceTimeline = buildTimeline(prioritizedActions);

  return {
    facilityId,
    analysisDate: new Date().toISOString(),
    overallRiskLevel,
    totalGaps: allGaps.length,
    criticalGaps,
    highGaps,
    mediumGaps,
    lowGaps,
    estimatedRemediationCost,
    prioritizedActions,
    complianceTimeline,
  };
}

function determineRiskLevel(
  critical: number,
  high: number,
  _medium: number
): "critical" | "high" | "medium" | "low" {
  if (critical > 0) return "critical";
  if (high > 2) return "high";
  if (high > 0) return "medium";
  return "low";
}

function estimateCosts(
  gaps: Array<{ gap: ComplianceGapResult; standard: string }>
): CostEstimate {
  const breakdown: Array<{ category: string; min: number; max: number }> = [];

  const categorized = new Map<string, Array<{ gap: ComplianceGapResult; standard: string }>>();
  for (const item of gaps) {
    const category = categorizeGap(item.standard);
    const existing = categorized.get(category) ?? [];
    existing.push(item);
    categorized.set(category, existing);
  }

  for (const [category, categoryGaps] of categorized) {
    const costs = categoryGaps.reduce(
      (acc, item) => {
        const { min, max } = getGapCostRange(item.gap.severity);
        return { min: acc.min + min, max: acc.max + max };
      },
      { min: 0, max: 0 }
    );
    breakdown.push({ category, min: costs.min, max: costs.max });
  }

  return {
    minimum: breakdown.reduce((sum, b) => sum + b.min, 0),
    maximum: breakdown.reduce((sum, b) => sum + b.max, 0),
    currency: "USD",
    breakdown,
  };
}

function categorizeGap(standard: string): string {
  if (standard.includes("1904")) return "Recordkeeping & Reporting";
  if (standard.includes("1910.147")) return "Lockout/Tagout";
  if (standard.includes("1910.146")) return "Confined Space";
  if (standard.includes("1910.134")) return "Respiratory Protection";
  if (standard.includes("370")) return "Chemical Inventory & Reporting";
  if (standard.includes("NFPA") || standard.includes("ASME")) return "Equipment Maintenance";
  return "General Safety";
}

function getGapCostRange(severity: string): { min: number; max: number } {
  switch (severity) {
    case "critical":
      return { min: 5000, max: 50000 };
    case "high":
      return { min: 2000, max: 20000 };
    case "medium":
      return { min: 500, max: 5000 };
    case "low":
      return { min: 100, max: 1000 };
    default:
      return { min: 0, max: 0 };
  }
}

function buildPrioritizedActions(
  gaps: Array<{ gap: ComplianceGapResult; standard: string }>
): PrioritizedAction[] {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  const sorted = [...gaps].sort(
    (a, b) => severityOrder[a.gap.severity] - severityOrder[b.gap.severity]
  );

  return sorted.map((item, index) => ({
    priority: index + 1,
    gap: item.gap,
    standard: item.standard,
    estimatedEffort: getEffortEstimate(item.gap.severity),
    deadline: getDeadline(item.gap.severity),
    responsibleParty: getResponsibleParty(item.standard),
  }));
}

function getEffortEstimate(severity: string): string {
  switch (severity) {
    case "critical":
      return "Immediate action required (1-3 days)";
    case "high":
      return "1-2 weeks";
    case "medium":
      return "2-4 weeks";
    case "low":
      return "1-3 months";
    default:
      return "TBD";
  }
}

function getDeadline(severity: string): string {
  const now = new Date();
  switch (severity) {
    case "critical":
      now.setDate(now.getDate() + 3);
      break;
    case "high":
      now.setDate(now.getDate() + 14);
      break;
    case "medium":
      now.setDate(now.getDate() + 30);
      break;
    case "low":
      now.setDate(now.getDate() + 90);
      break;
  }
  return now.toISOString().split("T")[0]!;
}

function getResponsibleParty(standard: string): string {
  if (standard.includes("1904")) return "Safety Manager / HR";
  if (standard.includes("1910.147")) return "Maintenance Manager";
  if (standard.includes("1910.146")) return "Safety Manager";
  if (standard.includes("1910.134")) return "Industrial Hygienist";
  if (standard.includes("370") || standard.includes("68")) return "Environmental Manager";
  if (standard.includes("NFPA") || standard.includes("ASME")) return "Facilities Manager";
  return "Safety Manager";
}

function buildTimeline(actions: PrioritizedAction[]): TimelineItem[] {
  const now = new Date();
  const timelineMap = new Map<string, { gaps: string[]; milestone: string }>();

  for (const action of actions) {
    const deadline = action.deadline;
    const existing = timelineMap.get(deadline);
    if (existing) {
      existing.gaps.push(action.gap.requirement.slice(0, 60));
    } else {
      timelineMap.set(deadline, {
        milestone: `Address ${action.gap.severity} priority items`,
        gaps: [action.gap.requirement.slice(0, 60)],
      });
    }
  }

  const timeline: TimelineItem[] = [];
  for (const [date, item] of timelineMap) {
    const deadlineDate = new Date(date);
    let status: TimelineItem["status"];
    if (deadlineDate < now) {
      status = "overdue";
    } else if (deadlineDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      status = "due_soon";
    } else if (deadlineDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
      status = "on_track";
    } else {
      status = "future";
    }
    timeline.push({ date, milestone: item.milestone, gaps: item.gaps, status });
  }

  return timeline.sort((a, b) => a.date.localeCompare(b.date));
}
