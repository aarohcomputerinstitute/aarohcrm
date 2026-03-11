"use client";

import { Save, Building, Mail, Phone, MapPin, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure institute profile and system preferences</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden divide-y divide-gray-100">
        
        {/* Institute Profile */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            Institute Profile
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-13">
            <div className="form-group">
              <label className="form-label">Institute Name</label>
              <input type="text" className="form-input" defaultValue="Aaroh Institute" />
            </div>
            <div className="form-group">
              <label className="form-label">Registration No. (Optional)</label>
              <input type="text" className="form-input" defaultValue="REG-2026-X892" />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Primary Phone</label>
              <input type="tel" className="form-input" defaultValue="+91 9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> Support Email</label>
              <input type="email" className="form-input" defaultValue="contact@aarohinstitute.com" />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Full Address</label>
              <textarea className="form-input resize-none" rows={3} defaultValue="123 Tech Park, Knowledge City, Bangalore, Karnataka"></textarea>
            </div>
          </div>
        </div>

        {/* System Config */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            Security & Preferences
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-13">
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select className="form-select">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="form-select">
                <option value="IST">Asia/Kolkata (IST)</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl mt-2">
              <div>
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to admin accounts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="p-8 bg-gray-50/50 flex justify-end">
          <button className="btn-primary shadow-md shadow-primary-500/20 px-8">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
