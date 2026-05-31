"use client";

import { useEffect, useState } from "react";
import { TrendingDown, DollarSign } from "lucide-react";

interface CostSavingsProps {
  totalSavings: number;
  hoursSaved: number;
}

export function CostSavings({ totalSavings, hoursSaved }: CostSavingsProps) {
  const [displayedSavings, setDisplayedSavings] = useState(0);
  const [displayedHours, setDisplayedHours] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const savingsIncrement = totalSavings / steps;
    const hoursIncrement = hoursSaved / steps;
    const interval = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current++;
      setDisplayedSavings(Math.min(Math.round(savingsIncrement * current), totalSavings));
      setDisplayedHours(Math.min(Math.round(hoursIncrement * current), hoursSaved));
      if (current >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [totalSavings, hoursSaved]);

  return (
    <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="h-5 w-5 text-green-600" />
        <h3 className="text-sm font-semibold text-green-900">Cost Savings vs. Manual Compliance</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-6 w-6 text-green-600" />
            <span className="text-3xl font-bold text-green-700">
              {displayedSavings.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">Estimated dollars saved</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-green-700">
            {displayedHours.toLocaleString()}
          </div>
          <p className="text-sm text-green-600 mt-1">Hours saved</p>
        </div>
      </div>
      <p className="text-xs text-green-600/80 mt-4 border-t border-green-200 pt-3">
        Based on industry average: $5,000 and 40 hours per manual compliance report
      </p>
    </div>
  );
}
