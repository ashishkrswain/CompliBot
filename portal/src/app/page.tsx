"use client";

import { Shield, FileText, Clock, CheckCircle, ArrowRight, BarChart3, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { ROICalculator } from "@/components/roi-calculator";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">CompliBot</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#reports" className="hover:text-brand-600 transition-colors">Report Types</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <a href="#roi" className="hover:text-brand-600 transition-colors">ROI Calculator</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-secondary text-sm">Sign In</Link>
            <Link href="/dashboard" className="btn-primary text-sm">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-blue-50" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
              <Shield className="h-4 w-4" />
              Trusted by 200+ industrial facilities
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              AI-Powered Compliance Reports.{" "}
              <span className="text-brand-600">Ready in Hours, Not Weeks.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Upload your operational data and receive complete, regulation-ready compliance reports
              with proper citations, findings, and corrective actions. OSHA, EPA, and maintenance
              regulations — handled autonomously.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary px-8 py-3 text-base">
                Generate Your First Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary px-8 py-3 text-base">
                See How It Works
              </a>
            </div>
          </div>

          {/* Trust metrics */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">99.2%</div>
              <div className="text-sm text-gray-600 mt-1">Regulatory Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">4 hrs</div>
              <div className="text-sm text-gray-600 mt-1">Avg. Report Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">$4.2M</div>
              <div className="text-sm text-gray-600 mt-1">Client Savings (2025)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">0</div>
              <div className="text-sm text-gray-600 mt-1">Citation Errors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Manual Compliance is Broken</h2>
            <p className="mt-4 text-lg text-gray-600">The traditional approach costs too much, takes too long, and produces inconsistent results.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <DollarSign className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">$50,000+/year</h3>
              <p className="mt-2 text-gray-600">Average compliance cost for a single mid-size facility using consultants and manual processes</p>
            </div>
            <div className="card text-center">
              <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">2-4 Weeks per Report</h3>
              <p className="mt-2 text-gray-600">Manual data collection, cross-referencing regulations, drafting, and review cycles</p>
            </div>
            <div className="card text-center">
              <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">30% Error Rate</h3>
              <p className="mt-2 text-gray-600">Incomplete citations, missed regulatory updates, and data entry mistakes in manual reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Three Steps to Compliance</h2>
            <p className="mt-4 text-lg text-gray-600">From raw operational data to submission-ready reports.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 text-brand-700 font-bold text-xl mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Data</h3>
              <p className="text-gray-600">Upload incident logs, maintenance records, chemical inventories, or training records. Any format — we extract the structured data.</p>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 text-brand-700 font-bold text-xl mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Generates Report</h3>
              <p className="text-gray-600">Our compliance engine cross-references your data against current regulations (29 CFR, 40 CFR) and generates a complete report with citations.</p>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 text-brand-700 font-bold text-xl mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Review and Submit</h3>
              <p className="text-gray-600">Review AI-generated findings, approve or request revisions, then download submission-ready documents. Your compliance officer verifies the final 10%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Report Types */}
      <section id="reports" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Supported Report Types</h2>
            <p className="mt-4 text-lg text-gray-600">Complete regulatory reports with accurate citations and findings.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">OSHA 300 Log</h3>
                  <p className="mt-1 text-sm text-gray-600">Complete Log of Work-Related Injuries and Illnesses per 29 CFR 1904. Includes 300A Annual Summary, TRIR/DART calculations, and trend analysis.</p>
                  <div className="mt-3 flex gap-2">
                    <span className="badge-blue">29 CFR 1904.7</span>
                    <span className="badge-blue">29 CFR 1904.29</span>
                    <span className="badge-blue">29 CFR 1904.32</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">EPA Tier II Chemical Inventory</h3>
                  <p className="mt-1 text-sm text-gray-600">EPCRA Section 312 Tier II reporting with chemical hazard classification, storage details, and SERC/LEPC submission formatting per 40 CFR 370.</p>
                  <div className="mt-3 flex gap-2">
                    <span className="badge-green">40 CFR 370.40</span>
                    <span className="badge-green">40 CFR 370.42</span>
                    <span className="badge-green">EPCRA Sec 312</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Maintenance Compliance Audit</h3>
                  <p className="mt-1 text-sm text-gray-600">Comprehensive audit of maintenance programs against OSHA, ASME, NFPA, and ANSI standards. Covers LOTO, cranes, pressure vessels, and fire protection.</p>
                  <div className="mt-3 flex gap-2">
                    <span className="badge-yellow">29 CFR 1910.147</span>
                    <span className="badge-yellow">NFPA 70B</span>
                    <span className="badge-yellow">ASME BPVC</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Safety Inspection Report</h3>
                  <p className="mt-1 text-sm text-gray-600">Detailed inspection findings classified by OSHA severity (Imminent Danger, Serious, Other-than-Serious) with specific regulatory citations and abatement timelines.</p>
                  <div className="mt-3 flex gap-2">
                    <span className="badge-red">29 CFR 1910</span>
                    <span className="badge-red">NFPA 101</span>
                    <span className="badge-red">29 CFR 1926</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Pay Per Report, Not Per Seat</h2>
            <p className="mt-4 text-lg text-gray-600">90% less than manual compliance consulting. No annual contracts required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Starter</h3>
              <p className="text-sm text-gray-600 mt-1">Single facility, basic reports</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$200</span>
                <span className="text-gray-600">/report</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />OSHA 300 Log generation</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Basic compliance check</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />PDF-ready downloads</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Email support</li>
              </ul>
              <Link href="/dashboard" className="btn-secondary w-full mt-8">Get Started</Link>
            </div>
            <div className="card border-2 border-brand-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>
              <h3 className="text-lg font-semibold text-gray-900">Professional</h3>
              <p className="text-sm text-gray-600 mt-1">Multi-facility, full suite</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$500</span>
                <span className="text-gray-600">/report</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />All report types (OSHA, EPA, Maintenance, Safety)</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Gap analysis with corrective actions</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Compliance scorecard and trends</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Priority support</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Unlimited document uploads</li>
              </ul>
              <Link href="/dashboard" className="btn-primary w-full mt-8">Start Free Trial</Link>
            </div>
            <div className="card border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Enterprise</h3>
              <p className="text-sm text-gray-600 mt-1">Custom volume pricing</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Volume discounts (50+ reports/year)</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Dedicated compliance advisor</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Custom report templates</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />API access for integration</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />SSO and audit logs</li>
              </ul>
              <a href="mailto:enterprise@complibot.ai" className="btn-secondary w-full mt-8">Contact Sales</a>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">Compare: Manual compliance reports typically cost $2,000-$20,000 each and take 2-4 weeks.</p>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Calculate Your Savings</h2>
            <p className="mt-4 text-lg text-gray-600">See how much CompliBot saves compared to manual compliance processes.</p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-900">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Automate Your Compliance?</h2>
          <p className="mt-4 text-lg text-brand-200">Join 200+ facilities that trust CompliBot for regulation-ready reports delivered in hours.</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-brand-700 shadow-sm hover:bg-gray-100 transition-colors">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-brand-300">No credit card required. First report free.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand-600" />
              <span className="text-lg font-bold text-gray-900">CompliBot</span>
            </div>
            <p className="text-sm text-gray-500">AI-powered compliance for industrial operations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
