"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Check, ChevronRight, FileText, Camera } from "lucide-react";
import FileUpload from "@/components/FileUpload";

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
  const [batches, setBatches] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    gender: "MALE",
    mobile: "",
    email: "",
    address: "",
    courseId: "",
    batchId: "",
    totalFee: "0",
    discount: "0",
    photoUrl: "",
    aadhaarUrl: "",
  });

  useEffect(() => {
    fetch("/api/courses").then(res => res.json()).then(data => setCourses(data || []));
    fetch("/api/batches").then(res => res.json()).then(data => setBatches(data || []));
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard/emitra?success=true");
      } else {
        alert("Referral failed. Please check details.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(b => b.courseId === formData.courseId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/emitra" className="p-2 hover:bg-white rounded-lg transition-colors border">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Student Referral</h1>
          <p className="text-sm text-gray-500">Student ki details fill karein aur commission earn karein.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {STEPS.map((s) => (
          <div key={s.id} className={`flex-1 h-1.5 rounded-full ${currentStep >= s.id ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
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
                <input required type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="form-input" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4">2. Course & Batch</h2>
            <div className="form-group">
              <label className="form-label">Select Course *</label>
              <select required name="courseId" value={formData.courseId} onChange={handleChange} className="form-select uppercase font-bold text-primary-700 bg-primary-50">
                <option value="">-- Choose Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} - ₹{c.fee}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prefered Batch</label>
              <select name="batchId" value={formData.batchId} onChange={handleChange} className="form-select">
                <option value="">-- Any Batch --</option>
                {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.batchName} ({b.startTime})</option>)}
              </select>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center mt-4">
              <span className="text-sm font-bold text-green-700">Estimated Commission</span>
              <span className="text-xl font-black text-green-700">₹{Math.floor(parseInt(formData.totalFee || "0") * 0.1)}</span>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in text-center py-4">
             <h2 className="text-lg font-bold text-gray-800 mb-6">3. Verification Documents</h2>
             <div className="grid grid-cols-1 gap-6 text-left">
                <FileUpload 
                  label="Student Photo"
                  bucket="student-documents"
                  folder="photos"
                  onUploadComplete={(url) => setFormData(p => ({...p, photoUrl: url}))}
                />
                <FileUpload 
                  label="ID Proof (Aadhaar Card)"
                  bucket="student-documents"
                  folder="ids"
                  onUploadComplete={(url) => setFormData(p => ({...p, aadhaarUrl: url}))}
                />
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === STEPS.length ? "Submit Referral" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
