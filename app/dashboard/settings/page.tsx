"use client";

import { useEffect, useState } from "react";
import { Save, Building, Mail, Phone, MapPin, Shield, Loader2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    instituteName: "",
    registrationNo: "",
    phone: "",
    email: "",
    address: "",
    currency: "INR",
    timezone: "IST",
    twoFactor: false,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings({
            instituteName: data.instituteName || "Aaroh Institute",
            registrationNo: data.registrationNo || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            currency: data.currency || "INR",
            timezone: data.timezone || "IST",
            twoFactor: data.twoFactor || false,
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (e) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

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
              <input type="text" className="form-input" value={settings.instituteName} onChange={e => setSettings({...settings, instituteName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Registration No. (Optional)</label>
              <input type="text" className="form-input" value={settings.registrationNo} onChange={e => setSettings({...settings, registrationNo: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Primary Phone</label>
              <input type="tel" className="form-input" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> Support Email</label>
              <input type="email" className="form-input" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Full Address</label>
              <textarea className="form-input resize-none" rows={3} value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})}></textarea>
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
              <select className="form-select" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})}>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="form-select" value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})}>
                <option value="IST">Asia/Kolkata (IST)</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl mt-2">
              <div>
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to admin accounts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.twoFactor} onChange={e => setSettings({...settings, twoFactor: e.target.checked})} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Backup */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <Save className="w-5 h-5" />
            </div>
            Data Backup (Export)
          </div>
          
          <div className="pl-13 space-y-4">
            <p className="text-sm text-gray-500">Download your CRM database in Excel/CSV format for offline backup. This is an Admin-only feature.</p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="/api/export?type=students"
                target="_blank"
                className="btn-secondary bg-white shadow-sm border border-gray-200"
              >
                <Save className="w-4 h-4 text-green-600" />
                Download Students Data (CSV)
              </a>
              <a 
                href="/api/export?type=fees"
                target="_blank"
                className="btn-secondary bg-white shadow-sm border border-gray-200"
              >
                <Save className="w-4 h-4 text-green-600" />
                Download Fee Data (CSV)
              </a>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-between">
          <div>
            {message && (
              <span className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> {message}
              </span>
            )}
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-primary shadow-md shadow-primary-500/20 px-8"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>

      </div>
    </div>
  );
}
