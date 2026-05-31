"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface IncidentForm {
  incidentDescription: string;
  dateOccurred: string;
  dateDiscovered: string;
  phiTypes: string[];
  individualsAffected: string;
  unauthorizedPerson: string;
  wasPhiViewed: string;
  mitigationsTaken: string;
  affectedStates: string[];
}

type AssessmentResult = {
  determination: "breach" | "non_breach";
  riskScore: number;
  factor1Score: number;
  factor2Score: number;
  factor3Score: number;
  factor4Score: number;
  notificationDeadline: string;
  hhsNotificationRequired: boolean;
  mediaNotificationRequired: boolean;
  individualsAffected: number;
};

const PHI_TYPE_OPTIONS = [
  "Patient names",
  "Social Security Numbers",
  "Medical record numbers",
  "Health insurance information",
  "Diagnosis/treatment information",
  "Dates of birth",
  "Contact information (address, phone, email)",
  "Financial/billing information",
  "Mental health records",
  "Substance abuse records",
  "HIV/AIDS status",
  "Genetic information",
  "Prescription information",
  "Lab results",
  "Imaging/radiology reports",
];

const STATE_OPTIONS = [
  { code: "CA", name: "California" },
  { code: "TX", name: "Texas" },
  { code: "NY", name: "New York" },
  { code: "FL", name: "Florida" },
  { code: "IL", name: "Illinois" },
  { code: "PA", name: "Pennsylvania" },
  { code: "OH", name: "Ohio" },
  { code: "GA", name: "Georgia" },
  { code: "NC", name: "North Carolina" },
  { code: "MA", name: "Massachusetts" },
];

export default function BreachAssessmentPage() {
  const [form, setForm] = useState<IncidentForm>({
    incidentDescription: "",
    dateOccurred: "",
    dateDiscovered: "",
    phiTypes: [],
    individualsAffected: "",
    unauthorizedPerson: "",
    wasPhiViewed: "unknown",
    mitigationsTaken: "",
    affectedStates: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handlePhiTypeToggle = (phiType: string) => {
    setForm((prev) => ({
      ...prev,
      phiTypes: prev.phiTypes.includes(phiType)
        ? prev.phiTypes.filter((t) => t !== phiType)
        : [...prev.phiTypes, phiType],
    }));
  };

  const handleStateToggle = (stateCode: string) => {
    setForm((prev) => ({
      ...prev,
      affectedStates: prev.affectedStates.includes(stateCode)
        ? prev.affectedStates.filter((s) => s !== stateCode)
        : [...prev.affectedStates, stateCode],
    }));
  };

  const handleGenerateAssessment = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "HIPAA_BREACH",
          operationalData: form.incidentDescription,
          extractedRecords: [
            { incidentDescription: form.incidentDescription },
            { dateOccurred: form.dateOccurred },
            { dateDiscovered: form.dateDiscovered },
            { individualsAffected: form.individualsAffected },
            { unauthorizedPerson: form.unauthorizedPerson },
            { wasPhiViewed: form.wasPhiViewed === "yes" },
            ...form.phiTypes.map((t) => ({ phiType: t })),
            ...form.mitigationsTaken.split("\n").filter((m) => m.trim()).map((m) => ({ mitigation: m.trim() })),
            ...form.affectedStates.map((s) => ({ state: s })),
          ],
          dateRangeStart: form.dateDiscovered || new Date().toISOString().split("T")[0],
          dateRangeEnd: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        // Calculate local determination for immediate display
        setResult(calculateLocalDetermination());
      }
    } catch {
      // Demo mode: calculate result locally
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setResult(calculateLocalDetermination());
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateLocalDetermination = (): AssessmentResult => {
    const numAffected = parseInt(form.individualsAffected, 10) || 1;

    // Factor 1: Nature of PHI
    const sensitiveTypes = ["Social Security Numbers", "Financial/billing information", "Mental health records", "Substance abuse records", "HIV/AIDS status"];
    const hasSensitive = form.phiTypes.some((t) => sensitiveTypes.includes(t));
    const factor1Score = hasSensitive ? 8 : form.phiTypes.length > 3 ? 6 : 3;

    // Factor 2: Unauthorized person
    const isExternal = form.unauthorizedPerson.toLowerCase().includes("hack") ||
      form.unauthorizedPerson.toLowerCase().includes("unknown") ||
      form.unauthorizedPerson.toLowerCase().includes("external");
    const factor2Score = isExternal ? 9 : 5;

    // Factor 3: Was PHI viewed
    const factor3Score = form.wasPhiViewed === "yes" ? 8 : form.wasPhiViewed === "no" ? 2 : 5;

    // Factor 4: Mitigations
    const mitigationCount = form.mitigationsTaken.split("\n").filter((m) => m.trim()).length;
    const factor4Score = Math.max(2, 8 - mitigationCount * 2);

    const avgScore = (factor1Score + factor2Score + factor3Score + factor4Score) / 4;
    const determination: "breach" | "non_breach" = avgScore < 4 ? "non_breach" : "breach";

    const discoveredDate = form.dateDiscovered ? new Date(form.dateDiscovered) : new Date();
    const deadline = new Date(discoveredDate);
    deadline.setDate(deadline.getDate() + 60);

    return {
      determination,
      riskScore: Math.round(avgScore * 10),
      factor1Score,
      factor2Score,
      factor3Score,
      factor4Score,
      notificationDeadline: deadline.toISOString().split("T")[0] ?? "",
      hhsNotificationRequired: determination === "breach",
      mediaNotificationRequired: determination === "breach" && numAffected >= 500,
      individualsAffected: numAffected,
    };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Breach Assessment</h1>
            <p className="text-sm text-gray-500">Per 45 CFR 164.400-414 — Breach Notification Rule</p>
          </div>
        </div>
      </div>

      {!result && !isGenerating && (
        <>
          {/* Incident Report Form */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h2>

            <div className="space-y-5">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What happened? (Describe the incident)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Describe the security incident in detail: what occurred, how it was discovered, who was involved..."
                  value={form.incidentDescription}
                  onChange={(e) => setForm({ ...form, incidentDescription: e.target.value })}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Incident Occurred</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.dateOccurred}
                    onChange={(e) => setForm({ ...form, dateOccurred: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Discovered</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.dateDiscovered}
                    onChange={(e) => setForm({ ...form, dateDiscovered: e.target.value })}
                  />
                </div>
              </div>

              {/* PHI Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What types of PHI were involved? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PHI_TYPE_OPTIONS.map((phiType) => (
                    <label
                      key={phiType}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                        form.phiTypes.includes(phiType)
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={form.phiTypes.includes(phiType)}
                        onChange={() => handlePhiTypeToggle(phiType)}
                      />
                      {phiType}
                    </label>
                  ))}
                </div>
              </div>

              {/* Individuals Affected */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Individuals Affected
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 250"
                    value={form.individualsAffected}
                    onChange={(e) => setForm({ ...form, individualsAffected: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unauthorized Person/Entity
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Unknown external hacker, former employee"
                    value={form.unauthorizedPerson}
                    onChange={(e) => setForm({ ...form, unauthorizedPerson: e.target.value })}
                  />
                </div>
              </div>

              {/* Was PHI viewed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Was the PHI actually acquired or viewed?
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "yes", label: "Yes — confirmed viewed/acquired" },
                    { value: "no", label: "No — PHI was not accessed" },
                    { value: "unknown", label: "Unknown — cannot confirm" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="wasPhiViewed"
                        value={option.value}
                        checked={form.wasPhiViewed === option.value}
                        onChange={(e) => setForm({ ...form, wasPhiViewed: e.target.value })}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mitigations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mitigations Taken (one per line)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder={"e.g.:\nRevoked unauthorized access immediately\nObtained signed confidentiality attestation\nReset all affected passwords"}
                  value={form.mitigationsTaken}
                  onChange={(e) => setForm({ ...form, mitigationsTaken: e.target.value })}
                />
              </div>

              {/* Affected States */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  States Where Affected Individuals Reside
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATE_OPTIONS.map((state) => (
                    <button
                      key={state.code}
                      type="button"
                      onClick={() => handleStateToggle(state.code)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.affectedStates.includes(state.code)
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {state.code} — {state.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Generate Button */}
          <button
            onClick={handleGenerateAssessment}
            disabled={!form.incidentDescription || !form.dateDiscovered}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Breach Assessment
          </button>
        </>
      )}

      {/* Loading State */}
      {isGenerating && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Performing 4-Factor Risk Assessment...</p>
              <p className="text-xs text-gray-500 mt-1">Analyzing per HHS Breach Notification Guidance (78 FR 5565)</p>
            </div>
          </div>
        </Card>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          {/* Determination Banner */}
          <Card
            className={`border-2 ${
              result.determination === "breach"
                ? "border-red-300 bg-red-50"
                : "border-green-300 bg-green-50"
            }`}
          >
            <div className="flex items-center gap-4">
              {result.determination === "breach" ? (
                <AlertCircle className="h-10 w-10 text-red-600 flex-shrink-0" />
              ) : (
                <ShieldCheck className="h-10 w-10 text-green-600 flex-shrink-0" />
              )}
              <div>
                <h2 className={`text-xl font-bold ${result.determination === "breach" ? "text-red-900" : "text-green-900"}`}>
                  {result.determination === "breach" ? "BREACH CONFIRMED" : "NON-BREACH DETERMINATION"}
                </h2>
                <p className={`text-sm mt-1 ${result.determination === "breach" ? "text-red-700" : "text-green-700"}`}>
                  {result.determination === "breach"
                    ? `Notification required. ${result.individualsAffected} individuals affected. Deadline: ${result.notificationDeadline}`
                    : "Low probability of compromise demonstrated. No notification required. Document determination per 164.530(j)."}
                </p>
              </div>
            </div>
          </Card>

          {/* Four-Factor Scores */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Four-Factor Risk Assessment Scores</h3>
            <div className="space-y-3">
              {[
                { label: "Factor 1: Nature & Extent of PHI", score: result.factor1Score, description: "Sensitivity of identifiers involved" },
                { label: "Factor 2: Unauthorized Person", score: result.factor2Score, description: "Who accessed/received the PHI" },
                { label: "Factor 3: PHI Actually Viewed/Acquired", score: result.factor3Score, description: "Whether PHI was accessed" },
                { label: "Factor 4: Mitigation Effectiveness", score: result.factor4Score, description: "Risk reduction from actions taken" },
              ].map((factor) => (
                <div key={factor.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{factor.label}</span>
                      <span className="text-xs text-gray-500 ml-2">({factor.description})</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{factor.score}/10</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.score >= 7 ? "bg-red-500" : factor.score >= 4 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${factor.score * 10}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Overall Risk Score</span>
                  <span className={`text-lg font-bold ${result.riskScore >= 60 ? "text-red-600" : result.riskScore >= 40 ? "text-yellow-600" : "text-green-600"}`}>
                    {result.riskScore}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Requirements */}
          {result.determination === "breach" && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Notification Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <span className="text-sm font-medium text-red-900">Individual Notification</span>
                    <span className="block text-xs text-red-700">Per 45 CFR 164.404 — by {result.notificationDeadline}</span>
                  </div>
                  <span className="text-xs font-semibold text-red-800 bg-red-200 px-2 py-1 rounded">REQUIRED</span>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg border ${result.hhsNotificationRequired ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                  <div>
                    <span className={`text-sm font-medium ${result.hhsNotificationRequired ? "text-red-900" : "text-gray-700"}`}>HHS/OCR Notification</span>
                    <span className={`block text-xs ${result.hhsNotificationRequired ? "text-red-700" : "text-gray-500"}`}>
                      Per 45 CFR 164.408 — {result.individualsAffected >= 500 ? "within 60 days (500+ individuals)" : "add to annual breach log"}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${result.hhsNotificationRequired ? "text-red-800 bg-red-200" : "text-gray-600 bg-gray-200"}`}>
                    {result.hhsNotificationRequired ? "REQUIRED" : "ANNUAL LOG"}
                  </span>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg border ${result.mediaNotificationRequired ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                  <div>
                    <span className={`text-sm font-medium ${result.mediaNotificationRequired ? "text-red-900" : "text-gray-700"}`}>Media Notification</span>
                    <span className={`block text-xs ${result.mediaNotificationRequired ? "text-red-700" : "text-gray-500"}`}>
                      Per 45 CFR 164.406 — {result.mediaNotificationRequired ? "required (500+ in a state)" : "not required (fewer than 500 in any state)"}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${result.mediaNotificationRequired ? "text-red-800 bg-red-200" : "text-gray-600 bg-gray-200"}`}>
                    {result.mediaNotificationRequired ? "REQUIRED" : "NOT REQUIRED"}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href="/dashboard/reports"
              className="flex-1 py-3 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              View Full Report
            </a>
            <button
              onClick={() => { setResult(null); setForm({ ...form, incidentDescription: "" }); }}
              className="px-4 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              New Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
