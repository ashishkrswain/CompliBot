"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { clsx } from "clsx";

interface ReportTypeOption {
  id: string;
  label: string;
  description: string;
  category: string;
}

const REPORT_TYPES: ReportTypeOption[] = [
  // Industrial
  { id: "OSHA_300", label: "OSHA 300 Log", description: "Log of Work-Related Injuries and Illnesses", category: "Industrial" },
  { id: "OSHA_300A", label: "OSHA 300A Summary", description: "Summary of Work-Related Injuries and Illnesses", category: "Industrial" },
  { id: "OSHA_301", label: "OSHA 301 Incident", description: "Injury and Illness Incident Report", category: "Industrial" },
  { id: "EPA_TIER2", label: "EPA Tier II", description: "Emergency and Hazardous Chemical Inventory", category: "Industrial" },
  { id: "EPA_TRI", label: "EPA TRI (Form R)", description: "Toxic Release Inventory Report", category: "Industrial" },
  { id: "MAINTENANCE_AUDIT", label: "Maintenance Audit", description: "Preventive maintenance compliance audit", category: "Industrial" },
  { id: "SAFETY_INSPECTION", label: "Safety Inspection", description: "Facility safety walkthrough report", category: "Industrial" },
  { id: "LOTO_AUDIT", label: "LOTO Procedure Audit", description: "Lockout/Tagout compliance verification", category: "Industrial" },
  { id: "PSM_AUDIT", label: "PSM Audit", description: "Process Safety Management compliance review", category: "Industrial" },
  // Healthcare
  { id: "HIPAA_SRA", label: "HIPAA Security Risk Assessment", description: "Required annual risk analysis per 45 CFR 164.308", category: "Healthcare" },
  { id: "HIPAA_BREACH", label: "HIPAA Breach Notification", description: "Breach notification and documentation", category: "Healthcare" },
  { id: "HIPAA_BAA", label: "HIPAA BAA Review", description: "Business Associate Agreement compliance", category: "Healthcare" },
  { id: "JOINT_COMMISSION", label: "Joint Commission Readiness", description: "Joint Commission accreditation prep", category: "Healthcare" },
  // Banking
  { id: "BSA_CTR", label: "BSA Currency Transaction", description: "Currency Transaction Report (CTR)", category: "Banking" },
  { id: "BSA_SAR", label: "BSA Suspicious Activity", description: "Suspicious Activity Report (SAR)", category: "Banking" },
  { id: "CRA_REPORT", label: "CRA Compliance", description: "Community Reinvestment Act assessment", category: "Banking" },
  { id: "FFIEC_CAT", label: "FFIEC Cybersecurity", description: "FFIEC Cybersecurity Assessment Tool", category: "Banking" },
  // Tech & Privacy
  { id: "SOC2_TYPE2", label: "SOC 2 Type II", description: "Service Organization Control readiness", category: "Tech/Privacy" },
  { id: "GDPR_DPIA", label: "GDPR Data Protection Impact", description: "Data Protection Impact Assessment", category: "Tech/Privacy" },
  { id: "NIST_CSF", label: "NIST Cybersecurity Framework", description: "NIST CSF assessment and gap analysis", category: "Tech/Privacy" },
  { id: "FEDRAMP", label: "FedRAMP Authorization", description: "Federal Risk and Authorization Management", category: "Tech/Privacy" },
  { id: "ISO_27001", label: "ISO 27001", description: "Information security management system", category: "Tech/Privacy" },
  { id: "PCI_DSS", label: "PCI DSS", description: "Payment Card Industry Data Security Standard", category: "Tech/Privacy" },
  // Safety
  { id: "EMERGENCY_ACTION_PLAN", label: "Emergency Action Plan", description: "OSHA 29 CFR 1910.38 compliance", category: "Safety" },
  { id: "FIRE_PREVENTION", label: "Fire Prevention Plan", description: "29 CFR 1910.39 fire prevention documentation", category: "Safety" },
  { id: "HAZCOM_PROGRAM", label: "HazCom Program", description: "Hazard Communication Standard program", category: "Safety" },
];

const CATEGORIES = ["Industrial", "Healthcare", "Banking", "Tech/Privacy", "Safety"];

const CATEGORY_COLORS: Record<string, string> = {
  Industrial: "border-blue-200 bg-blue-50 hover:border-blue-400",
  Healthcare: "border-green-200 bg-green-50 hover:border-green-400",
  Banking: "border-purple-200 bg-purple-50 hover:border-purple-400",
  "Tech/Privacy": "border-indigo-200 bg-indigo-50 hover:border-indigo-400",
  Safety: "border-red-200 bg-red-50 hover:border-red-400",
};

const CATEGORY_SELECTED: Record<string, string> = {
  Industrial: "border-blue-500 bg-blue-100 ring-2 ring-blue-300",
  Healthcare: "border-green-500 bg-green-100 ring-2 ring-green-300",
  Banking: "border-purple-500 bg-purple-100 ring-2 ring-purple-300",
  "Tech/Privacy": "border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300",
  Safety: "border-red-500 bg-red-100 ring-2 ring-red-300",
};

export default function NewReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const selectedTypeObj = REPORT_TYPES.find((t) => t.id === selectedType);

  async function handleGenerate() {
    if (!selectedType) return;
    setGenerating(true);
    setGenError(null);

    const res = await api.generateReport({
      projectId: "default",
      reportType: selectedType,
      dateRangeStart: dateRangeStart || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dateRangeEnd: dateRangeEnd || new Date().toISOString().split("T")[0],
    });

    if (res.error) {
      setGenError(res.error);
      setGenerating(false);
      return;
    }

    if (res.data) {
      router.push(`/dashboard/reports/${res.data.reportId}`);
    } else {
      setGenError("Unexpected response from server");
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Generate New Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a report type, configure options, and let AI generate your compliance report.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={clsx(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                s < step
                  ? "bg-brand-600 text-white"
                  : s === step
                    ? "bg-brand-100 text-brand-700 border-2 border-brand-600"
                    : "bg-gray-100 text-gray-400"
              )}
            >
              {s < step ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            <span
              className={clsx(
                "text-sm font-medium",
                s === step ? "text-gray-900" : "text-gray-400"
              )}
            >
              {s === 1 ? "Select Type" : s === 2 ? "Configure" : "Generate"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Report Type */}
      {step === 1 && (
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const types = REPORT_TYPES.filter((t) => t.category === category);
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {types.map((type) => {
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={clsx(
                          "text-left p-4 rounded-lg border transition-all cursor-pointer",
                          isSelected
                            ? CATEGORY_SELECTED[category]
                            : CATEGORY_COLORS[category]
                        )}
                      >
                        <p className="text-sm font-semibold text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              size="md"
              disabled={!selectedType}
              onClick={() => setStep(2)}
            >
              Next: Configure
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Configuration Form */}
      {step === 2 && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">
                Generating: <span className="font-medium text-gray-700">{selectedTypeObj?.label}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date Range Start
                </label>
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date Range End
                </label>
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Facility Name
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g. Houston Plant #1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Facility Address
                </label>
                <input
                  type="text"
                  value={facilityAddress}
                  onChange={(e) => setFacilityAddress(e.target.value)}
                  placeholder="e.g. 4500 Industrial Blvd, Houston, TX 77001"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(3)}>
                Generate Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Generating */}
      {step === 3 && (
        <Card>
          <div className="text-center py-12">
            {generating ? (
              <>
                <Loader2 className="h-12 w-12 text-brand-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900">Generating Report</h3>
                <p className="text-sm text-gray-500 mt-2">
                  AI is analyzing data and generating your{" "}
                  <span className="font-medium">{selectedTypeObj?.label}</span> report...
                </p>
                <p className="text-xs text-gray-400 mt-1">This usually takes 15-30 seconds</p>
              </>
            ) : genError ? (
              <>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <ArrowLeft className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Generation Failed</h3>
                <p className="text-sm text-red-600 mt-2">{genError}</p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Button variant="secondary" size="md" onClick={() => setStep(2)}>
                    Back to Configuration
                  </Button>
                  <Button variant="primary" size="md" onClick={handleGenerate}>
                    Retry
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to Generate</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click below to start generating your{" "}
                  <span className="font-medium">{selectedTypeObj?.label}</span> report.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Button variant="secondary" size="md" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button variant="primary" size="md" onClick={handleGenerate}>
                    Start Generation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
