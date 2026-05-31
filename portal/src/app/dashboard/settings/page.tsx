"use client";

import { useState } from "react";
import { Building2, Users, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("Acme Manufacturing Corp");
  const [industry, setIndustry] = useState("Manufacturing");
  const [size, setSize] = useState("mid-market");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organization profile, facilities, and users.</p>
      </div>

      {/* Organization Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-gray-900">Organization Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
              <option>Manufacturing</option>
              <option>Chemical</option>
              <option>Petroleum</option>
              <option>Construction</option>
              <option>Warehousing</option>
              <option>Utilities</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="input">
              <option value="small">Small (1-50 employees)</option>
              <option value="mid-market">Mid-Market (51-500 employees)</option>
              <option value="enterprise">Enterprise (500+ employees)</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>

      {/* Facilities */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Facilities</h2>
          </div>
          <Button variant="secondary" size="sm">Add Facility</Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Acme Plant #1 - Houston</h3>
              <p className="text-xs text-gray-500 mt-0.5">4500 Industrial Blvd, Houston, TX 77001</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>Manufacturing Plant</span>
                <span>245 employees</span>
                <span>NAICS: 332710</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Acme Warehouse - Katy</h3>
              <p className="text-xs text-gray-500 mt-0.5">1200 Commerce Dr, Katy, TX 77449</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>Warehouse/Distribution</span>
                <span>62 employees</span>
                <span>NAICS: 493110</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Acme Office - Downtown</h3>
              <p className="text-xs text-gray-500 mt-0.5">800 Main St Suite 400, Houston, TX 77002</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>Office/Administrative</span>
                <span>35 employees</span>
                <span>NAICS: 551114</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>
      </Card>

      {/* Users */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>
          <Button variant="secondary" size="sm">Invite Member</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 text-sm font-medium text-gray-900">Sarah Johnson</td>
                <td className="py-3 text-sm text-gray-600">admin@acmemfg.com</td>
                <td className="py-3"><span className="badge-blue">Admin</span></td>
                <td className="py-3"><Button variant="ghost" size="sm">Edit</Button></td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-900">Mike Chen</td>
                <td className="py-3 text-sm text-gray-600">mchen@acmemfg.com</td>
                <td className="py-3"><span className="badge-green">Safety Manager</span></td>
                <td className="py-3"><Button variant="ghost" size="sm">Edit</Button></td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-900">Lisa Park</td>
                <td className="py-3 text-sm text-gray-600">lpark@acmemfg.com</td>
                <td className="py-3"><span className="badge-gray">Member</span></td>
                <td className="py-3"><Button variant="ghost" size="sm">Edit</Button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
