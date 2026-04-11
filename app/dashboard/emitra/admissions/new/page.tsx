"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Check, ChevronRight, FileText, Camera, Wallet } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { formatCurrency } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Student Info" },
  { id: 2, name: "Course Selection" },
  { id: 3, name: "Documents" }
];

export default function EmitraNewAdmissionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "MALE",
    mobile: "",
    email: "",
    address: "",
    courseId: "",
    totalFee: "",
    feeOffered: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/courses").then(res => res.json()).then(data => setCourses(data || []));
    fetch("/api/me")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setCurrentUser(data);
      })
      .catch(() => console.log("Session fetch failed"));
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      const course = courses.find(c => c.id === formData.courseId);
      if (course) {
        setFormData(prev => ({ ...prev, totalFee: course.fee.toString() }));
      }
    }
  }, [formData.courseId, courses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (e.target.name === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 2) { // Simplified to 2 steps for Inquiry
      setCurrentStep(prev => prev + 1);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        mobile: formData.mobile,
        email: formData.email || null,
        courseId: formData.courseId || null,
        feeOffered: formData.feeOffered || null,
        notes: `Pointed Center Referral Address: ${formData.address}. ${formData.notes}`,
        source: "OTHER", // Will be overridden as EMITRA in API based on role
      };

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/emitra?success=true");
      } else {
        const err = await res.json();
        alert(err.error || "Referral failed. Please check details.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/emitra" className="p-2 hover:bg-white rounded-lg transition-colors border">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Enquiry (Lead)</h1>
          <p className="text-sm text-gray-500">Student ki basic details fill karein. Admin isse verify karke admission mein convert karega.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2].map((id) => (
          <div key={id} className={`flex-1 h-1.5 rounded-full ${currentStep >= id ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card p-6 shadow-sm bg-white border">
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4">1. Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group col-span-1">
                <label className="form-label">First Name *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group col-span-1">
                <label className="form-label">Last Name *</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Mobile Number *</label>
                <input 
                  required 
                  type="tel" 
                  name="mobile" 
                  value={formData.mobile} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="10 digit mobile number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Optional" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="form-input" placeholder="Student ka address" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4">2. Course Selection</h2>
            <div className="form-group">
              <label className="form-label">Select Interested Course *</label>
              <select required name="courseId" value={formData.courseId} onChange={handleChange} className="form-select font-bold text-primary-700 bg-primary-50">
                <option value="">-- Choose Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Course Fee (Official)</label>
                <input type="text" readOnly value={formData.totalFee ? `₹ ${formData.totalFee}` : "₹ 0"} className="form-input bg-gray-50 text-gray-500 font-mono" />
              </div>
                <div className="flex flex-col gap-2">
                  <label className="form-label">Fee Offered *</label>
                  <input 
                    required 
                    type="number" 
                    name="feeOffered" 
                    value={formData.feeOffered} 
                    onChange={handleChange} 
                    className="form-input font-bold text-primary-600 border-primary-200 focus:ring-primary-500" 
                    placeholder="₹ 0.00"
                  />
                  {formData.feeOffered && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                       <div className="p-2 bg-green-100 rounded-lg">
                         <Wallet className="w-5 h-5 text-green-600" />
                       </div>
                       <div>
                         <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest leading-none">Your Estimated Commission</p>
                         <p className="text-lg font-black text-green-700 mt-1">
                           {formatCurrency(Number(formData.feeOffered) * ((currentUser?.commissionRate || 10) / 100))}
                           <span className="text-xs ml-1.5 font-bold opacity-60">({currentUser?.commissionRate || 10}%)</span>
                         </p>
                       </div>
                    </div>
                  )}
                </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="form-input" placeholder="Student ke baare mein koi aur jaankari..." />
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
               <div className="flex gap-3">
                 <div className="p-2 bg-blue-100 rounded-lg h-fit">
                    <FileText className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-blue-800">Inquiry Process</h4>
                   <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                     Aapke dwara submit ki gayi inquiry Admin dashboard mein show hogi. Jaise hi student admission confirm karega, aapka commission dashboard mein update ho jayega.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <button 
            type="button" 
            onClick={() => setCurrentStep(p => p - 1)} 
            disabled={currentStep === 1 || loading}
            className="btn-ghost disabled:opacity-0"
          >
            Back
          </button>
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === 2 ? "Submit Inquiry" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
