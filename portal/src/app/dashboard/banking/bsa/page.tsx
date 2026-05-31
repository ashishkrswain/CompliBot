"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  Users,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface InstitutionProfile {
  institutionName: string;
  institutionType: "national-bank" | "state-member-bank" | "state-nonmember-bank" | "savings-association" | "credit-union";
  charterNumber: string;
  assetSize: string;
  employeeCount: string;
  branchCount: string;
  productsOffered: string[];
}

interface CustomerSegments {
  segments: string[];
  cashIntensivePercentage: string;
  internationalCustomerPercentage: string;
  pepCount: string;
  msbCount: string;
}

interface GeographicAssessment {
  domesticMarkets: string[];
  internationalExposure: boolean;
  correspondentBanking: boolean;
  foreignBranches: boolean;
  countriesServed: string[];
  wireVolumeMonthly: string;
  internationalWireVolume: "none" | "low" | "moderate" | "high";
}

interface ControlsInventory {
  controls: string[];
  automatedMonitoring: string;
  lastExamDate: string;
  lastExamRating: string;
  bsaOfficerName: string;
  lastAuditDate: string;
}

const PRODUCT_OPTIONS = [
  "Wire Transfers",
  "Correspondent Banking",
  "Private Banking",
  "MSB Accounts",
  "Trade Finance",
  "Remote Deposit Capture",
  "ACH Origination",
  "Cash Management",
  "Trust Services",
  "Digital Banking",
  "Consumer Lending",
  "Residential Mortgages",
  "Commercial Real Estate",
  "Credit Cards",
];

const CUSTOMER_SEGMENT_OPTIONS = [
  "Money Service Businesses",
  "Politically Exposed Persons",
  "Non-Resident Aliens",
  "Cannabis-Related Businesses",
  "Third-Party Payment Processors",
  "Foreign Financial Institutions",
  "Cash-Intensive Businesses",
  "Nonprofit Organizations",
  "Professional Services",
  "Retail Consumers",
  "Small Businesses",
  "Large Corporations",
];

const CONTROL_OPTIONS = [
  "BSA/AML Officer Designated",
  "BSA/AML Policy Approved by Board",
  "Independent Testing/Audit Program",
  "Training Program (All Staff)",
  "Automated Transaction Monitoring System",
  "CIP/CDD Procedures Documented",
  "EDD Procedures for High-Risk",
  "SAR Filing Process",
  "CTR Filing Process",
  "OFAC Screening System",
  "314(a) Process",
  "314(b) Information Sharing",
  "Correspondent Banking EDD",
  "Beneficial Ownership Procedures",
  "Risk Assessment (Current Year)",
];

const stepLabels = [
  { step: 1, label: "Institution Profile", icon: Building2 },
  { step: 2, label: "Customer Segments", icon: Users },
  { step: 3, label: "Geographic Assessment", icon: Globe },
  { step: 4, label: "Current Controls", icon: Lock },
  { step: 5, label: "Generate Assessment", icon: Shield },
] as const;

export default function BSARiskAssessmentPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile>({
    institutionName: "",
    institutionType: "national-bank",
    charterNumber: "",
    assetSize: "",
    employeeCount: "",
    branchCount: "",
    productsOffered: [],
  });

  const [customerSegments, setCustomerSegments] = useState<CustomerSegments>({
    segments: [],
    cashIntensivePercentage: "",
    internationalCustomerPercentage: "",
    pepCount: "",
    msbCount: "",
  });

  const [geographicAssessment, setGeographicAssessment] = useState<GeographicAssessment>({
    domesticMarkets: [],
    internationalExposure: false,
    correspondentBanking: false,
    foreignBranches: false,
    countriesServed: [],
    wireVolumeMonthly: "",
    internationalWireVolume: "none",
  });

  const [controlsInventory, setControlsInventory] = useState<ControlsInventory>({
    controls: [],
    automatedMonitoring: "",
    lastExamDate: "",
    lastExamRating: "",
    bsaOfficerName: "",
    lastAuditDate: "",
  });

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return institutionProfile.institutionName.trim() !== "" && institutionProfile.assetSize.trim() !== "";
      case 2:
        return customerSegments.segments.length > 0;
      case 3:
        return geographicAssessment.domesticMarkets.length > 0 || geographicAssessment.domesticMarkets.toString().trim() !== "";
      case 4:
        return controlsInventory.controls.length > 0;
      case 5:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call — in production this calls the backend engine
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setGeneratedReport("Assessment generated successfully. View the complete BSA/AML Risk Assessment in the Reports section.");
    setIsGenerating(false);
  };

  const toggleProduct = (product: string) => {
    setInstitutionProfile((prev) => ({
      ...prev,
      productsOffered: prev.productsOffered.includes(product)
        ? prev.productsOffered.filter((p) => p !== product)
        : [...prev.productsOffered, product],
    }));
  };

  const toggleSegment = (segment: string) => {
    setCustomerSegments((prev) => ({
      ...prev,
      segments: prev.segments.includes(segment)
        ? prev.segments.filter((s) => s !== segment)
        : [...prev.segments, segment],
    }));
  };

  const toggleControl = (control: string) => {
    setControlsInventory((prev) => ({
      ...prev,
      controls: prev.controls.includes(control)
        ? prev.controls.filter((c) => c !== control)
        : [...prev.controls, control],
    }));
  };

  const handleDomesticMarketsChange = (value: string) => {
    setGeographicAssessment((prev) => ({
      ...prev,
      domesticMarkets: value.split(",").map((m) => m.trim()).filter((m) => m !== ""),
    }));
  };

  const handleCountriesChange = (value: string) => {
    setGeographicAssessment((prev) => ({
      ...prev,
      countriesServed: value.split(",").map((c) => c.trim()).filter((c) => c !== ""),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">BSA/AML Risk Assessment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate a comprehensive risk assessment per FFIEC BSA/AML Examination Manual methodology
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {stepLabels.map(({ step, label, icon: Icon }) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              currentStep === step
                ? "bg-brand-50 border border-brand-200"
                : currentStep > step
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200"
            }`}>
              {currentStep > step ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Icon className={`h-4 w-4 ${currentStep === step ? "text-brand-600" : "text-gray-400"}`} />
              )}
              <span className={`text-xs font-medium ${
                currentStep === step ? "text-brand-700" : currentStep > step ? "text-green-700" : "text-gray-500"
              }`}>
                {label}
              </span>
            </div>
            {step < 5 && <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Step 1: Institution Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
                <input
                  type="text"
                  value={institutionProfile.institutionName}
                  onChange={(e) => setInstitutionProfile((prev) => ({ ...prev, institutionName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="First National Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Charter Type</label>
                <select
                  value={institutionProfile.institutionType}
                  onChange={(e) => setInstitutionProfile((prev) => ({ ...prev, institutionType: e.target.value as InstitutionProfile["institutionType"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="national-bank">National Bank (OCC)</option>
                  <option value="state-member-bank">State Member Bank (FRB)</option>
                  <option value="state-nonmember-bank">State Nonmember Bank (FDIC)</option>
                  <option value="savings-association">Savings Association (OCC)</option>
                  <option value="credit-union">Credit Union (NCUA)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Charter/RSSD Number</label>
                <input
                  type="text"
                  value={institutionProfile.charterNumber}
                  onChange={(e) => setInstitutionProfile((prev) => ({ ...prev, charterNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Assets (USD) *</label>
                <input
                  type="text"
                  value={institutionProfile.assetSize}
                  onChange={(e) => setInstitutionProfile((prev) => ({ ...prev, assetSize: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="2,500,000,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                <input
                  type="text"
                  value={institutionProfile.employeeCount}
                  onChange={(e) => setInstitutionProfile((prev) => ({ ...prev, employeeCount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="450"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Count</label>
                <input
                  type="text"
                  value={institutionProfile.branchCount}
                  onChange={(e) => setInstitutionProfile((prev) => ({ ...prev, branchCount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="22"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Products and Services Offered</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PRODUCT_OPTIONS.map((product) => (
                  <label key={product} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={institutionProfile.productsOffered.includes(product)}
                      onChange={() => toggleProduct(product)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-gray-700">{product}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Step 2: Customer Segments</h2>
            <p className="text-sm text-gray-500">Select all customer segments present in your institution's portfolio.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Segments (Higher Risk Categories)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CUSTOMER_SEGMENT_OPTIONS.map((segment) => (
                  <label key={segment} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customerSegments.segments.includes(segment)}
                      onChange={() => toggleSegment(segment)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-gray-700">{segment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cash-Intensive Business % of Portfolio</label>
                <input
                  type="text"
                  value={customerSegments.cashIntensivePercentage}
                  onChange={(e) => setCustomerSegments((prev) => ({ ...prev, cashIntensivePercentage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">International Customer %</label>
                <input
                  type="text"
                  value={customerSegments.internationalCustomerPercentage}
                  onChange={(e) => setCustomerSegments((prev) => ({ ...prev, internationalCustomerPercentage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of PEP Relationships</label>
                <input
                  type="text"
                  value={customerSegments.pepCount}
                  onChange={(e) => setCustomerSegments((prev) => ({ ...prev, pepCount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of MSB Relationships</label>
                <input
                  type="text"
                  value={customerSegments.msbCount}
                  onChange={(e) => setCustomerSegments((prev) => ({ ...prev, msbCount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="12"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Step 3: Geographic Assessment</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domestic Markets (comma-separated)</label>
              <input
                type="text"
                value={geographicAssessment.domesticMarkets.join(", ")}
                onChange={(e) => handleDomesticMarketsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Atlanta, Miami, Charlotte, Nashville"
              />
              <p className="text-xs text-gray-500 mt-1">Enter MSA names or cities where the institution operates</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">International Activity</label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={geographicAssessment.internationalExposure}
                  onChange={(e) => setGeographicAssessment((prev) => ({ ...prev, internationalExposure: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-gray-700">Has international exposure</span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={geographicAssessment.correspondentBanking}
                  onChange={(e) => setGeographicAssessment((prev) => ({ ...prev, correspondentBanking: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-gray-700">Maintains correspondent banking relationships</span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={geographicAssessment.foreignBranches}
                  onChange={(e) => setGeographicAssessment((prev) => ({ ...prev, foreignBranches: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-gray-700">Has foreign branch offices</span>
              </label>
            </div>

            {geographicAssessment.internationalExposure && (
              <div className="space-y-4 pl-4 border-l-2 border-brand-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Countries Served (comma-separated)</label>
                  <input
                    type="text"
                    value={geographicAssessment.countriesServed.join(", ")}
                    onChange={(e) => handleCountriesChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Mexico, Canada, United Kingdom, Colombia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Wire Transfer Volume</label>
                  <input
                    type="text"
                    value={geographicAssessment.wireVolumeMonthly}
                    onChange={(e) => setGeographicAssessment((prev) => ({ ...prev, wireVolumeMonthly: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">International Wire Volume Level</label>
                  <select
                    value={geographicAssessment.internationalWireVolume}
                    onChange={(e) => setGeographicAssessment((prev) => ({ ...prev, internationalWireVolume: e.target.value as GeographicAssessment["internationalWireVolume"] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="none">None</option>
                    <option value="low">Low (&lt;5% of total wires)</option>
                    <option value="moderate">Moderate (5-15% of total wires)</option>
                    <option value="high">High (&gt;15% of total wires)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Step 4: Current Controls Inventory</h2>
            <p className="text-sm text-gray-500">Select all BSA/AML controls currently implemented at the institution.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BSA/AML Program Controls</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CONTROL_OPTIONS.map((control) => (
                  <label key={control} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={controlsInventory.controls.includes(control)}
                      onChange={() => toggleControl(control)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-gray-700">{control}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Automated Monitoring System</label>
                <input
                  type="text"
                  value={controlsInventory.automatedMonitoring}
                  onChange={(e) => setControlsInventory((prev) => ({ ...prev, automatedMonitoring: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="e.g., Verafin, Actimize, SAS AML"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BSA/AML Officer Name</label>
                <input
                  type="text"
                  value={controlsInventory.bsaOfficerName}
                  onChange={(e) => setControlsInventory((prev) => ({ ...prev, bsaOfficerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Jane Smith, VP/BSA Officer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last BSA Exam Date</label>
                <input
                  type="date"
                  value={controlsInventory.lastExamDate}
                  onChange={(e) => setControlsInventory((prev) => ({ ...prev, lastExamDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Exam BSA Rating</label>
                <select
                  value={controlsInventory.lastExamRating}
                  onChange={(e) => setControlsInventory((prev) => ({ ...prev, lastExamRating: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">Select rating</option>
                  <option value="1 - Strong">1 - Strong</option>
                  <option value="2 - Satisfactory">2 - Satisfactory</option>
                  <option value="3 - Less than Satisfactory">3 - Less than Satisfactory</option>
                  <option value="4 - Deficient">4 - Deficient</option>
                  <option value="5 - Critically Deficient">5 - Critically Deficient</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Independent BSA Audit Date</label>
                <input
                  type="date"
                  value={controlsInventory.lastAuditDate}
                  onChange={(e) => setControlsInventory((prev) => ({ ...prev, lastAuditDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Step 5: Generate Assessment</h2>

            {!generatedReport ? (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Assessment Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Institution:</span> <span className="font-medium">{institutionProfile.institutionName || "Not provided"}</span></div>
                    <div><span className="text-gray-500">Type:</span> <span className="font-medium">{institutionProfile.institutionType}</span></div>
                    <div><span className="text-gray-500">Assets:</span> <span className="font-medium">${institutionProfile.assetSize || "Not provided"}</span></div>
                    <div><span className="text-gray-500">Products:</span> <span className="font-medium">{institutionProfile.productsOffered.length} selected</span></div>
                    <div><span className="text-gray-500">Customer Segments:</span> <span className="font-medium">{customerSegments.segments.length} selected</span></div>
                    <div><span className="text-gray-500">Markets:</span> <span className="font-medium">{geographicAssessment.domesticMarkets.length} domestic</span></div>
                    <div><span className="text-gray-500">International:</span> <span className="font-medium">{geographicAssessment.internationalExposure ? "Yes" : "No"}</span></div>
                    <div><span className="text-gray-500">Controls:</span> <span className="font-medium">{controlsInventory.controls.length} of {CONTROL_OPTIONS.length}</span></div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    The assessment will generate a complete BSA/AML/OFAC Risk Assessment per FFIEC BSA/AML Examination Manual including:
                    products/services risk matrix, customer risk assessment, geographic risk analysis, control effectiveness evaluation,
                    and residual risk determination with regulatory citations.
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Assessment...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Generate BSA/AML Risk Assessment
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-green-800">{generatedReport}</p>
                <button
                  onClick={() => { setGeneratedReport(null); setCurrentStep(1); }}
                  className="mt-4 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 underline"
                >
                  Start New Assessment
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {currentStep < 5 && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
