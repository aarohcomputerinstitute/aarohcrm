"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, User, Phone, MapPin, Calendar, BookOpen } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AddInquiryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    courseId: "",
    source: "WALK_IN",
    status: "NEW",
    followupDate: "",
    notes: "",
    counselorId: "",
    feeOffered: "",
  });

  useEffect(() => {
    fetch("/api/courses").then(res => res.json()).then(data => setCourses(data || []));
    fetch("/api/users").then(res => res.json()).then(data => setUsers(data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard/inquiries");
        router.refresh();
      } else {
        alert("Failed to create inquiry");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inquiries" className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Inquiry</h1>
            <p className="text-sm text-gray-500 mt-0.5">Register a new prospective student</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="card-body p-8 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-primary-600 tracking-wider uppercase mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  className="form-input" 
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="form-input pl-9" 
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Email Address (Optional)</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input" 
                  placeholder="student@example.com"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Course & Source */}
          <div>
            <h3 className="text-sm font-semibold text-primary-600 tracking-wider uppercase mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Course Interest
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label flex justify-between items-center">
                  Interested Course
                  {formData.courseId && courses.find(c => c.id === formData.courseId) && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 animate-pulse">
                      Standard Fee: {formatCurrency(courses.find(c => c.id === formData.courseId).fee)}
                    </span>
                  )}
                </label>
                <select 
                  name="courseId" 
                  value={formData.courseId}
                  onChange={(e) => {
                    const selectedCourse = courses.find(c => c.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      courseId: e.target.value,
                      feeOffered: formData.feeOffered || (selectedCourse ? selectedCourse.fee.toString() : "")
                    });
                  }}
                  className="form-select"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Lead Source</label>
                <select 
                  name="source" 
                  value={formData.source}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="WALK_IN">Walk-in</option>
                  <option value="GOOGLE">Google</option>
                  <option value="WEBSITE">Website</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Counselor</label>
                <select 
                  name="counselorId" 
                  value={formData.counselorId}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select Counselor --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fee Offered (₹)</label>
                <input 
                  type="number" 
                  name="feeOffered"
                  value={formData.feeOffered}
                  onChange={handleChange}
                  className="form-input" 
                  placeholder="e.g. 15000"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Follow-up */}
          <div>
            <h3 className="text-sm font-semibold text-primary-600 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Follow-up Action
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select 
                  name="status" 
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="NEW">New Inquiry</option>
                  <option value="FOLLOWUP">Follow-up Required</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input 
                  type="date" 
                  name="followupDate"
                  value={formData.followupDate}
                  onChange={handleChange}
                  className="form-input" 
                />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Counselor Notes</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="form-input resize-none" 
                  placeholder="Enter any discussion details, objections, or preferred timings..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex items-center justify-end gap-3">
          <Link href="/dashboard/inquiries" className="btn-ghost">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Inquiry
          </button>
        </div>
      </form>
    </div>
  );
}
