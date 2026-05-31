"use client";

import { useState } from "react";
import { DollarSign, TrendingDown } from "lucide-react";

export function ROICalculator() {
  const [facilities, setFacilities] = useState(3);
  const [reportsPerYear, setReportsPerYear] = useState(12);
  const [currentCostPerReport, setCurrentCostPerReport] = useState(5000);

  const complibotCostPerReport = 500;
  const currentAnnualCost = facilities * reportsPerYear * currentCostPerReport;
  const complibotAnnualCost = facilities * reportsPerYear * complibotCostPerReport;
  const annualSavings = currentAnnualCost - complibotAnnualCost;
  const savingsPercentage = currentAnnualCost > 0 ? Math.round((annualSavings / currentAnnualCost) * 100) : 0;

  // Time savings: manual avg 40 hrs/report, CompliBot avg 2 hrs
  const manualHoursPerReport = 40;
  const complibotHours = 2;
  const hoursSavedPerYear = facilities * reportsPerYear * (manualHoursPerReport - complibotHours);
  const fteSaved = (hoursSavedPerYear / 2080).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Current Situation</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Facilities
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={facilities}
                onChange={(e) => setFacilities(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1</span>
                <span className="font-semibold text-brand-600">{facilities}</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reports per Facility per Year
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={reportsPerYear}
                onChange={(e) => setReportsPerYear(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1</span>
                <span className="font-semibold text-brand-600">{reportsPerYear}</span>
                <span>30</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Cost per Report ($)
              </label>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={currentCostPerReport}
                onChange={(e) => setCurrentCostPerReport(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>$1,000</span>
                <span className="font-semibold text-brand-600">${currentCostPerReport.toLocaleString()}</span>
                <span>$20,000</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Annual Savings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current annual spend:</span>
                <span className="text-sm font-medium text-gray-900">${currentAnnualCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CompliBot annual cost:</span>
                <span className="text-sm font-medium text-green-700">${complibotAnnualCost.toLocaleString()}</span>
              </div>
              <div className="border-t border-brand-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">Annual savings:</span>
                  <span className="text-2xl font-bold text-green-600">${annualSavings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{savingsPercentage}% cost reduction</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-700">{hoursSavedPerYear.toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-1">Hours saved/year</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-700">{fteSaved}</div>
                <div className="text-xs text-gray-600 mt-1">FTE equivalent saved</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-brand-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">3-Year Total Savings</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                ${(annualSavings * 3).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
