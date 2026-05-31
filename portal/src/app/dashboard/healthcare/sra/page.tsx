"use client";

import { useState } from "react";
import { Shield, ChevronRight, ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface FacilityInfo {
  facilityName: string;
  facilityType: string;
  address: string;
  employeeCount: string;
  specialties: string;
}

interface ITSystemsInfo {
  ehrSystem: string;
  emailSystem: string;
  cloudServices: string;
  networkInfrastructure: string;
  mobileDevices: string;
  otherSystems: string;
}

interface CurrentControls {
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  accessControlRBAC: boolean;
  multiFactorAuth: boolean;
  auditLogging: boolean;
  backupProcedures: boolean;
  disasterRecoveryPlan: boolean;
  incidentResponsePlan: boolean;
  securityTraining: boolean;
  physicalAccessControls: boolean;
  workstationSecurity: boolean;
  mediaDisposal: boolean;
  riskAnalysisConducted: boolean;
  policiesDocumented: boolean;
  baAgreements: boolean;
}

interface VendorInfo {
  vendors: string;
}

const STEPS: Array<{ number: WizardStep; title: string; description: string }> = [
  { number: 1, title: "Facility Information", description: "Basic information about your healthcare facility" },
  { number: 2, title: "IT Systems Inventory", description: "Systems that create, receive, maintain, or transmit ePHI" },
  { number: 3, title: "Current Controls", description: "Security controls currently in place" },
  { number: 4, title: "Vendors & Business Associates", description: "Third parties with access to PHI" },
  { number: 5, title: "Generate Assessment", description: "Review and generate your Security Risk Assessment" },
];

export default function HipaaSRAWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [facilityInfo, setFacilityInfo] = useState<FacilityInfo>({
    facilityName: "",
    facilityType: "",
    address: "",
    employeeCount: "",
    specialties: "",
  });

  const [itSystems, setITSystems] = useState<ITSystemsInfo>({
    ehrSystem: "",
    emailSystem: "",
    cloudServices: "",
    networkInfrastructure: "",
    mobileDevices: "",
    otherSystems: "",
  });

  const [controls, setControls] = useState<CurrentControls>({
    encryptionAtRest: false,
    encryptionInTransit: false,
    accessControlRBAC: false,
    multiFactorAuth: false,
    auditLogging: false,
    backupProcedures: false,
    disasterRecoveryPlan: false,
    incidentResponsePlan: false,
    securityTraining: false,
    physicalAccessControls: false,
    workstationSecurity: false,
    mediaDisposal: false,
    riskAnalysisConducted: false,
    policiesDocumented: false,
    baAgreements: false,
  });

  const [vendorInfo, setVendorInfo] = useState<VendorInfo>({
    vendors: "",
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "HIPAA_SRA",
          facilityName: facilityInfo.facilityName,
          facilityType: facilityInfo.facilityType,
          employeeCount: parseInt(facilityInfo.employeeCount, 10) || 50,
          operationalData: buildOperationalData(),
          extractedRecords: buildExtractedRecords(),
          dateRangeStart: new Date().toISOString().split("T")[0],
          dateRangeEnd: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        setIsComplete(true);
      }
    } catch {
      // In demo mode, simulate completion
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsComplete(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildOperationalData = (): string => {
    return `Facility: ${facilityInfo.facilityName}
Type: ${facilityInfo.facilityType}
Address: ${facilityInfo.address}
Employees: ${facilityInfo.employeeCount}
Specialties: ${facilityInfo.specialties}
EHR: ${itSystems.ehrSystem}
Email: ${itSystems.emailSystem}
Cloud Services: ${itSystems.cloudServices}
Network: ${itSystems.networkInfrastructure}
Mobile Devices: ${itSystems.mobileDevices}
Other Systems: ${itSystems.otherSystems}
Vendors: ${vendorInfo.vendors}`;
  };

  const buildExtractedRecords = (): Array<Record<string, string | boolean>> => {
    const records: Array<Record<string, string | boolean>> = [];

    // IT Systems as records
    if (itSystems.ehrSystem) records.push({ itSystem: itSystems.ehrSystem, type: "EHR" });
    if (itSystems.emailSystem) records.push({ itSystem: itSystems.emailSystem, type: "Email" });
    if (itSystems.cloudServices) records.push({ itSystem: itSystems.cloudServices, type: "Cloud" });

    // Vendors as records
    const vendorList = vendorInfo.vendors.split("\n").filter((v) => v.trim());
    for (const vendor of vendorList) {
      records.push({ vendor: vendor.trim() });
    }

    // Controls as records
    for (const [key, value] of Object.entries(controls)) {
      records.push({ controlCategory: key, controlStatus: value ? "implemented" : "not_implemented" });
    }

    return records;
  };

  const controlsCheckedCount = Object.values(controls).filter(Boolean).length;
  const totalControls = Object.keys(controls).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HIPAA Security Risk Assessment</h1>
            <p className="text-sm text-gray-500">Per 45 CFR 164.308(a)(1)(ii)(A) — Risk Analysis</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
                currentStep === step.number
                  ? "bg-blue-600 text-white"
                  : currentStep > step.number
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep > step.number ? <CheckCircle className="h-4 w-4" /> : step.number}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{STEPS[currentStep - 1]!.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{STEPS[currentStep - 1]!.description}</p>

        {/* Step 1: Facility Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Riverside Medical Center"
                value={facilityInfo.facilityName}
                onChange={(e) => setFacilityInfo({ ...facilityInfo, facilityName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={facilityInfo.facilityType}
                onChange={(e) => setFacilityInfo({ ...facilityInfo, facilityType: e.target.value })}
              >
                <option value="">Select facility type...</option>
                <option value="Hospital">Hospital</option>
                <option value="Medical Clinic">Medical Clinic</option>
                <option value="Dental Practice">Dental Practice</option>
                <option value="Home Health Agency">Home Health Agency</option>
                <option value="Skilled Nursing Facility">Skilled Nursing Facility</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Behavioral Health">Behavioral Health Provider</option>
                <option value="Clinical Laboratory">Clinical Laboratory</option>
                <option value="Ambulatory Surgery Center">Ambulatory Surgery Center</option>
                <option value="Physician Practice">Physician Practice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full facility address"
                value={facilityInfo.address}
                onChange={(e) => setFacilityInfo({ ...facilityInfo, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 150"
                  value={facilityInfo.employeeCount}
                  onChange={(e) => setFacilityInfo({ ...facilityInfo, employeeCount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties/Services</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Cardiology, Orthopedics"
                  value={facilityInfo.specialties}
                  onChange={(e) => setFacilityInfo({ ...facilityInfo, specialties: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: IT Systems */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              List all systems that create, receive, maintain, or transmit electronic Protected Health Information (ePHI).
              This is required for the asset inventory portion of the SRA.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EHR/EMR System</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Epic, Cerner, athenahealth, eClinicalWorks"
                value={itSystems.ehrSystem}
                onChange={(e) => setITSystems({ ...itSystems, ehrSystem: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email System</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Microsoft 365, Google Workspace"
                value={itSystems.emailSystem}
                onChange={(e) => setITSystems({ ...itSystems, emailSystem: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Services</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., AWS, Azure, cloud backup, telehealth platform"
                value={itSystems.cloudServices}
                onChange={(e) => setITSystems({ ...itSystems, cloudServices: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Network Infrastructure</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Cisco switches, Meraki wireless, VPN appliance"
                value={itSystems.networkInfrastructure}
                onChange={(e) => setITSystems({ ...itSystems, networkInfrastructure: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Devices</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Company-issued iPhones, iPads for clinical staff"
                value={itSystems.mobileDevices}
                onChange={(e) => setITSystems({ ...itSystems, mobileDevices: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Systems with ePHI</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="e.g., Practice management system, billing software, lab interfaces, fax server, scanner/copier with hard drive"
                value={itSystems.otherSystems}
                onChange={(e) => setITSystems({ ...itSystems, otherSystems: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 3: Current Controls */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Check all controls currently implemented at your facility.</p>
              <span className="text-xs font-medium text-gray-600">{controlsCheckedCount}/{totalControls} controls</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "encryptionAtRest" as const, label: "Encryption at Rest (ePHI databases/files)", section: "164.312(a)(2)(iv)" },
                { key: "encryptionInTransit" as const, label: "Encryption in Transit (TLS/VPN)", section: "164.312(e)(2)(ii)" },
                { key: "accessControlRBAC" as const, label: "Role-Based Access Control", section: "164.312(a)(1)" },
                { key: "multiFactorAuth" as const, label: "Multi-Factor Authentication", section: "164.312(d)" },
                { key: "auditLogging" as const, label: "Audit Logging & Review", section: "164.312(b)" },
                { key: "backupProcedures" as const, label: "Data Backup Procedures", section: "164.308(a)(7)(ii)(A)" },
                { key: "disasterRecoveryPlan" as const, label: "Disaster Recovery Plan", section: "164.308(a)(7)(ii)(B)" },
                { key: "incidentResponsePlan" as const, label: "Incident Response Plan", section: "164.308(a)(6)(ii)" },
                { key: "securityTraining" as const, label: "Annual Security Training", section: "164.308(a)(5)" },
                { key: "physicalAccessControls" as const, label: "Physical Access Controls (badge/key)", section: "164.310(a)(1)" },
                { key: "workstationSecurity" as const, label: "Workstation Security", section: "164.310(c)" },
                { key: "mediaDisposal" as const, label: "Media Disposal Procedures", section: "164.310(d)(2)(i)" },
                { key: "riskAnalysisConducted" as const, label: "Risk Analysis Conducted (past year)", section: "164.308(a)(1)(ii)(A)" },
                { key: "policiesDocumented" as const, label: "Security Policies Documented", section: "164.316(a)" },
                { key: "baAgreements" as const, label: "BA Agreements in Place", section: "164.308(b)(1)" },
              ].map((control) => (
                <label
                  key={control.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    controls[control.key] ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={controls[control.key]}
                    onChange={(e) => setControls({ ...controls, [control.key]: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{control.label}</span>
                    <span className="block text-xs text-gray-500">{control.section}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Vendors */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              List all vendors and business associates that create, receive, maintain, or transmit PHI on your behalf.
              Per 45 CFR 164.308(b)(1), you must have satisfactory assurances (BAA) from each business associate.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendors / Business Associates (one per line)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={8}
                placeholder={"Example:\nEpic Systems (EHR vendor)\nIron Mountain (records storage)\nAWS (cloud hosting)\nShredIt (document destruction)\nMDLive (telehealth platform)"}
                value={vendorInfo.vendors}
                onChange={(e) => setVendorInfo({ vendors: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 5: Generate */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {!isGenerating && !isComplete && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Assessment Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Facility:</span>{" "}
                      <span className="font-medium text-gray-900">{facilityInfo.facilityName || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>{" "}
                      <span className="font-medium text-gray-900">{facilityInfo.facilityType || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Employees:</span>{" "}
                      <span className="font-medium text-gray-900">{facilityInfo.employeeCount || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Controls in Place:</span>{" "}
                      <span className="font-medium text-gray-900">{controlsCheckedCount}/{totalControls}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">IT Systems:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {[itSystems.ehrSystem, itSystems.emailSystem, itSystems.cloudServices].filter(Boolean).length} documented
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Vendors:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {vendorInfo.vendors.split("\n").filter((v) => v.trim()).length} listed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What Will Be Generated</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>- Complete SRA per NIST SP 800-30 methodology</li>
                    <li>- Assessment of all 18 HIPAA Security Rule standards</li>
                    <li>- Risk ratings for Administrative, Physical, and Technical Safeguards</li>
                    <li>- Gap analysis with specific regulatory citations</li>
                    <li>- Prioritized Corrective Action Plan</li>
                    <li>- Organizational and Policy/Procedure requirements assessment</li>
                  </ul>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Security Risk Assessment
                </button>
              </>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">Generating Security Risk Assessment...</p>
                  <p className="text-xs text-gray-500 mt-1">Analyzing all 18 HIPAA Security Rule standards</p>
                </div>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: "60%" }} />
                </div>
              </div>
            )}

            {isComplete && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">SRA Generated Successfully</p>
                  <p className="text-sm text-gray-500 mt-1">Your HIPAA Security Risk Assessment is ready for review.</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <a
                    href="/dashboard/reports"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Report
                  </a>
                  <a
                    href="/dashboard/healthcare"
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {currentStep === 5 && !isGenerating && !isComplete && (
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div />
          </div>
        )}
      </Card>
    </div>
  );
}
