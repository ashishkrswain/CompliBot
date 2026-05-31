"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  Loader2,
  CheckCircle2,
  User,
  DollarSign,
  Flag,
  Clock,
} from "lucide-react";

interface SubjectInfo {
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  idType: string;
  idNumber: string;
  occupation: string;
  relationship: string;
  accountNumbers: string;
  branchOfActivity: string;
}

interface TransactionEntry {
  id: string;
  date: string;
  type: string;
  amount: string;
  fromAccount: string;
  toAccount: string;
  beneficiary: string;
  description: string;
}

interface RedFlagEntry {
  id: string;
  category: string;
  description: string;
  observedDate: string;
  evidence: string;
}

interface TimelineEntry {
  id: string;
  date: string;
  event: string;
  significance: string;
}

const TRANSACTION_TYPES = [
  "Cash Deposit",
  "Cash Withdrawal",
  "Domestic Wire Transfer",
  "International Wire Transfer",
  "ACH Transaction",
  "Check Transaction",
  "Monetary Instrument Purchase",
  "Internal Account Transfer",
  "Loan Payment",
  "Other",
];

const RED_FLAG_CATEGORIES = [
  "Structuring / Smurfing",
  "Rapid Movement of Funds",
  "Unusual Wire Activity",
  "Cash Activity Inconsistent with Business",
  "Round Dollar Transactions",
  "Funnel Account Activity",
  "High-Risk Geographic Transactions",
  "Identity / Documentation Concerns",
  "Insider Activity",
  "Fraud Indicators",
  "Third-Party Activity",
  "Layering / Complex Transactions",
  "Trade-Based ML Indicators",
  "Terrorist Financing Indicators",
  "Other Suspicious Pattern",
];

const ACTIVITY_TYPES = [
  "Structuring",
  "Money Laundering",
  "Terrorist Financing",
  "Check Fraud",
  "Wire Fraud",
  "Mortgage Fraud",
  "Identity Theft",
  "Insider Abuse",
  "Computer Intrusion",
  "Account Takeover",
  "Elder Financial Exploitation",
  "Loan Fraud",
  "Securities Fraud",
  "Other",
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export default function SARNarrativePage() {
  const [activeTab, setActiveTab] = useState<"subject" | "transactions" | "redflags" | "timeline" | "generate">("subject");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNarrative, setGeneratedNarrative] = useState<string | null>(null);

  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [cumulativeAmount, setCumulativeAmount] = useState("");
  const [activityDateStart, setActivityDateStart] = useState("");
  const [activityDateEnd, setActivityDateEnd] = useState("");

  const [subject, setSubject] = useState<SubjectInfo>({
    lastName: "",
    firstName: "",
    dateOfBirth: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    idType: "",
    idNumber: "",
    occupation: "",
    relationship: "accountholder",
    accountNumbers: "",
    branchOfActivity: "",
  });

  const [transactions, setTransactions] = useState<TransactionEntry[]>([
    { id: generateId(), date: "", type: "", amount: "", fromAccount: "", toAccount: "", beneficiary: "", description: "" },
  ]);

  const [redFlags, setRedFlags] = useState<RedFlagEntry[]>([
    { id: generateId(), category: "", description: "", observedDate: "", evidence: "" },
  ]);

  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    { id: generateId(), date: "", event: "", significance: "" },
  ]);

  const [actionsTaken, setActionsTaken] = useState<string[]>([""]);

  const addTransaction = () => {
    setTransactions((prev) => [...prev, { id: generateId(), date: "", type: "", amount: "", fromAccount: "", toAccount: "", beneficiary: "", description: "" }]);
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id: string, field: keyof TransactionEntry, value: string) => {
    setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const addRedFlag = () => {
    setRedFlags((prev) => [...prev, { id: generateId(), category: "", description: "", observedDate: "", evidence: "" }]);
  };

  const removeRedFlag = (id: string) => {
    setRedFlags((prev) => prev.filter((f) => f.id !== id));
  };

  const updateRedFlag = (id: string, field: keyof RedFlagEntry, value: string) => {
    setRedFlags((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f));
  };

  const addTimelineEntry = () => {
    setTimeline((prev) => [...prev, { id: generateId(), date: "", event: "", significance: "" }]);
  };

  const removeTimelineEntry = (id: string) => {
    setTimeline((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTimelineEntry = (id: string, field: keyof TimelineEntry, value: string) => {
    setTimeline((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleActivityType = (type: string) => {
    setActivityTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setGeneratedNarrative(buildPreviewNarrative());
    setIsGenerating(false);
  };

  const buildPreviewNarrative = (): string => {
    const subjectName = `${subject.firstName} ${subject.lastName}`.trim() || "[Subject Name]";
    const amount = cumulativeAmount ? `$${Number(cumulativeAmount).toLocaleString()}` : "[Amount]";
    const period = activityDateStart && activityDateEnd ? `${activityDateStart} through ${activityDateEnd}` : "[Activity Period]";

    let narrative = `[Institution Name] is filing this Suspicious Activity Report to report activity involving ${subjectName} that is consistent with ${activityTypes.join(", ") || "[Activity Type]"}. The suspicious activity occurred during the period of ${period}, and involved a cumulative amount of approximately ${amount}.\n\n`;

    narrative += `SUBJECT INFORMATION:\n`;
    narrative += `${subjectName}`;
    if (subject.dateOfBirth) narrative += `, date of birth ${subject.dateOfBirth}`;
    if (subject.address) narrative += `, residing at ${subject.address}, ${subject.city}, ${subject.state} ${subject.zipCode}`;
    narrative += `.\n\n`;

    if (subject.accountNumbers) {
      narrative += `RELATIONSHIP TO INSTITUTION:\n`;
      narrative += `${subjectName} is a ${subject.relationship} maintaining account number(s) ${subject.accountNumbers} at the ${subject.branchOfActivity || "[Branch]"} branch.\n\n`;
    }

    const validTransactions = transactions.filter((t) => t.date && t.amount);
    if (validTransactions.length > 0) {
      narrative += `TRANSACTION DETAILS:\n`;
      for (const txn of validTransactions) {
        narrative += `On ${txn.date}, a ${txn.type || "transaction"} in the amount of $${Number(txn.amount).toLocaleString()}`;
        if (txn.fromAccount) narrative += ` from account ${txn.fromAccount}`;
        if (txn.toAccount) narrative += ` to account ${txn.toAccount}`;
        if (txn.description) narrative += `. ${txn.description}`;
        narrative += `.\n`;
      }
      narrative += `\n`;
    }

    const validFlags = redFlags.filter((f) => f.description);
    if (validFlags.length > 0) {
      narrative += `RED FLAGS AND INDICATORS:\n`;
      for (const flag of validFlags) {
        narrative += `- ${flag.category ? `[${flag.category}] ` : ""}${flag.description}`;
        if (flag.observedDate) narrative += ` (observed ${flag.observedDate})`;
        narrative += `.\n`;
      }
      narrative += `\n`;
    }

    const validActions = actionsTaken.filter((a) => a.trim() !== "");
    if (validActions.length > 0) {
      narrative += `ACTIONS TAKEN:\n`;
      for (const action of validActions) {
        narrative += `- ${action}\n`;
      }
    }

    return narrative;
  };

  const tabs = [
    { id: "subject" as const, label: "Subject Info", icon: User },
    { id: "transactions" as const, label: "Transactions", icon: DollarSign },
    { id: "redflags" as const, label: "Red Flags", icon: Flag },
    { id: "timeline" as const, label: "Timeline", icon: Clock },
    { id: "generate" as const, label: "Generate", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SAR Narrative Generator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate filing-ready SAR narratives per FinCEN quality standards (31 CFR 1010.320)
        </p>
      </div>

      {/* Activity Type & Amount Header */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Activity Type(s)</label>
            <div className="flex flex-wrap gap-1">
              {activityTypes.length > 0 ? activityTypes.map((type) => (
                <Badge key={type} variant="warning" className="text-xs cursor-pointer" onClick={() => toggleActivityType(type)}>
                  {type} x
                </Badge>
              )) : (
                <span className="text-xs text-gray-400">Select below</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cumulative Amount</label>
            <input
              type="text"
              value={cumulativeAmount}
              onChange={(e) => setCumulativeAmount(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
              placeholder="50000"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Start Date</label>
              <input type="date" value={activityDateStart} onChange={(e) => setActivityDateStart(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">End Date</label>
              <input type="date" value={activityDateEnd} onChange={(e) => setActivityDateEnd(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Suspicious Activity Categories</label>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleActivityType(type)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  activityTypes.includes(type)
                    ? "bg-orange-100 border-orange-300 text-orange-800"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card className="p-6">
        {activeTab === "subject" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Subject Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                <input type="text" value={subject.lastName} onChange={(e) => setSubject((prev) => ({ ...prev, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                <input type="text" value={subject.firstName} onChange={(e) => setSubject((prev) => ({ ...prev, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                <input type="date" value={subject.dateOfBirth} onChange={(e) => setSubject((prev) => ({ ...prev, dateOfBirth: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SSN (last 4)</label>
                <input type="text" value={subject.ssn} onChange={(e) => setSubject((prev) => ({ ...prev, ssn: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="1234" maxLength={4} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ID Type</label>
                <select value={subject.idType} onChange={(e) => setSubject((prev) => ({ ...prev, idType: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="">Select</option>
                  <option value="Drivers License">Driver's License</option>
                  <option value="Passport">Passport</option>
                  <option value="State ID">State ID</option>
                  <option value="Military ID">Military ID</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ID Number</label>
                <input type="text" value={subject.idNumber} onChange={(e) => setSubject((prev) => ({ ...prev, idNumber: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="D12345678" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <input type="text" value={subject.address} onChange={(e) => setSubject((prev) => ({ ...prev, address: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="123 Main Street" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input type="text" value={subject.city} onChange={(e) => setSubject((prev) => ({ ...prev, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                <input type="text" value={subject.state} onChange={(e) => setSubject((prev) => ({ ...prev, state: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" maxLength={2} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ZIP Code</label>
                <input type="text" value={subject.zipCode} onChange={(e) => setSubject((prev) => ({ ...prev, zipCode: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" maxLength={10} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Occupation</label>
                <input type="text" value={subject.occupation} onChange={(e) => setSubject((prev) => ({ ...prev, occupation: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Restaurant Owner" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                <select value={subject.relationship} onChange={(e) => setSubject((prev) => ({ ...prev, relationship: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="accountholder">Account Holder</option>
                  <option value="agent">Agent</option>
                  <option value="borrower">Borrower</option>
                  <option value="customer">Customer</option>
                  <option value="employee">Employee</option>
                  <option value="officer">Officer</option>
                  <option value="no-relationship">No Relationship</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Account Number(s)</label>
                <input type="text" value={subject.accountNumbers} onChange={(e) => setSubject((prev) => ({ ...prev, accountNumbers: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="1234567890, 0987654321" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Branch of Activity</label>
                <input type="text" value={subject.branchOfActivity} onChange={(e) => setSubject((prev) => ({ ...prev, branchOfActivity: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Main Office" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Suspicious Transactions</h3>
              <button onClick={addTransaction} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Transaction
              </button>
            </div>

            {transactions.map((txn, idx) => (
              <div key={txn.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Transaction #{idx + 1}</span>
                  {transactions.length > 1 && (
                    <button onClick={() => removeTransaction(txn.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input type="date" value={txn.date} onChange={(e) => updateTransaction(txn.id, "date", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select value={txn.type} onChange={(e) => updateTransaction(txn.id, "type", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                      <option value="">Select</option>
                      {TRANSACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
                    <input type="text" value={txn.amount} onChange={(e) => updateTransaction(txn.id, "amount", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="9800" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From Account</label>
                    <input type="text" value={txn.fromAccount} onChange={(e) => updateTransaction(txn.id, "fromAccount", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To Account</label>
                    <input type="text" value={txn.toAccount} onChange={(e) => updateTransaction(txn.id, "toAccount", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Beneficiary</label>
                    <input type="text" value={txn.beneficiary} onChange={(e) => updateTransaction(txn.id, "beneficiary", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <input type="text" value={txn.description} onChange={(e) => updateTransaction(txn.id, "description", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Describe the transaction and why it is suspicious" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "redflags" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Red Flags Identified</h3>
              <button onClick={addRedFlag} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Red Flag
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                Common red flags per FFIEC BSA/AML Manual: transactions just below CTR threshold, rapid movement of funds through accounts,
                transactions inconsistent with stated business purpose, unusual use of monetary instruments, multiple accounts with similar activity patterns.
              </p>
            </div>

            {redFlags.map((flag, idx) => (
              <div key={flag.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Red Flag #{idx + 1}</span>
                  {redFlags.length > 1 && (
                    <button onClick={() => removeRedFlag(flag.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <select value={flag.category} onChange={(e) => updateRedFlag(flag.id, "category", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                      <option value="">Select category</option>
                      {RED_FLAG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date Observed</label>
                    <input type="date" value={flag.observedDate} onChange={(e) => updateRedFlag(flag.id, "observedDate", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea value={flag.description} onChange={(e) => updateRedFlag(flag.id, "description", e.target.value)} rows={2} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Describe the specific red flag observed..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Supporting Evidence</label>
                    <input type="text" value={flag.evidence} onChange={(e) => updateRedFlag(flag.id, "evidence", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Transaction records, account statements, surveillance, etc." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Timeline of Events</h3>
              <button onClick={addTimelineEntry} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Event
              </button>
            </div>

            {timeline.map((entry, idx) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Event #{idx + 1}</span>
                  {timeline.length > 1 && (
                    <button onClick={() => removeTimelineEntry(entry.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input type="date" value={entry.date} onChange={(e) => updateTimelineEntry(entry.id, "date", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Event Description</label>
                    <input type="text" value={entry.event} onChange={(e) => updateTimelineEntry(entry.id, "event", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Subject conducted multiple cash deposits at different branches..." />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Significance</label>
                    <input type="text" value={entry.significance} onChange={(e) => updateTimelineEntry(entry.id, "significance", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Why is this event relevant to the suspicious activity?" />
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions Taken by Institution</h3>
              {actionsTaken.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => {
                      const updated = [...actionsTaken];
                      updated[idx] = e.target.value;
                      setActionsTaken(updated);
                    }}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="e.g., Account placed on enhanced monitoring, Relationship terminated..."
                  />
                  {actionsTaken.length > 1 && (
                    <button onClick={() => setActionsTaken((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setActionsTaken((prev) => [...prev, ""])}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-1"
              >
                + Add Action
              </button>
            </div>
          </div>
        )}

        {activeTab === "generate" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Generate SAR Narrative</h3>

            {!generatedNarrative ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">FinCEN SAR Narrative Requirements</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>- Must include the 5 Ws: Who, What, When, Where, Why/How</li>
                    <li>- Must be factual — no legal conclusions about criminal intent</li>
                    <li>- Must include specific transaction details (dates, amounts, accounts)</li>
                    <li>- Must describe the suspicious pattern clearly</li>
                    <li>- Must reference specific red flags identified</li>
                    <li>- Must note institution relationship and actions taken</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Data Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-gray-500">Subject:</span> <span className="font-medium">{subject.firstName} {subject.lastName || "—"}</span></div>
                    <div><span className="text-gray-500">Activity:</span> <span className="font-medium">{activityTypes.length > 0 ? activityTypes[0] : "—"}</span></div>
                    <div><span className="text-gray-500">Amount:</span> <span className="font-medium">{cumulativeAmount ? `$${Number(cumulativeAmount).toLocaleString()}` : "—"}</span></div>
                    <div><span className="text-gray-500">Transactions:</span> <span className="font-medium">{transactions.filter((t) => t.date).length}</span></div>
                    <div><span className="text-gray-500">Red Flags:</span> <span className="font-medium">{redFlags.filter((f) => f.description).length}</span></div>
                    <div><span className="text-gray-500">Timeline Events:</span> <span className="font-medium">{timeline.filter((t) => t.date).length}</span></div>
                    <div><span className="text-gray-500">Actions:</span> <span className="font-medium">{actionsTaken.filter((a) => a.trim()).length}</span></div>
                    <div><span className="text-gray-500">Period:</span> <span className="font-medium">{activityDateStart || "—"} to {activityDateEnd || "—"}</span></div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !subject.lastName || activityTypes.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Narrative...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Generate SAR Narrative
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Narrative Generated Successfully</span>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {generatedNarrative}
                  </pre>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedNarrative)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => setGeneratedNarrative(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Edit and Regenerate
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  This narrative is ready to paste into FinCEN BSA E-Filing System SAR Form (Part V — Narrative).
                  Review for accuracy before filing. All SAR filings are confidential per 31 USC 5318(g)(2).
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
