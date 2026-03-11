"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Check, ChevronRight, FileText, Camera } from "lucide-react";
import FileUpload from "@/components/FileUpload";

const STEPS = [
  { id: 1, name: "Personal Details" },
  { id: 2, name: "Contact & Address" },
  { id: 3, name: "Course & Fees" },
  { id: 4, name: "Documents Upload" }
];

export default function NewAdmissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get("inquiryId");

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "MALE",
    category: "GENERAL",
    
    mobile: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    courseId: "",
    batchId: "",
    totalFee: "",
    discount: "0",
    inquiryId: inquiryId || "",
    photoUrl: "",
    aadhaarUrl: "",
  });

  useEffect(() => {
    fetch("/api/courses").then(res => res.json()).then(data => setCourses(data || []));
    fetch("/api/batches").then(res => res.json()).then(data => setBatches(data || []));

    // If inquiry ID is passed, pre-fill data
    if (inquiryId) {
      fetch(`/api/inquiries/${inquiryId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            const parts = data.name.split(" ");
            setFormData(prev => ({
              ...prev,
              firstName: parts[0],
              lastName: parts.slice(1).join(" ") || "",
              mobile: data.mobile,
              email: data.email || "",
              courseId: data.courseId || "",
            }));
          }
        });
    }
  }, [inquiryId]);

  // Update total fee automatically when course changes
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length) return nextStep();

    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard/students");
        router.refresh();
      } else {
        alert("Failed to create admission");
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admissions" className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admission Form</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enroll a new student</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full hidden sm:block"></div>
        <div className="flex justify-between relative sm:px-4">
          {STEPS.map((step) => (
            <div key={step.id} className={`flex flex-col items-center gap-2 ${currentStep >= step.id ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`step-indicator ${
                currentStep > step.id ? 'step-completed' : currentStep === step.id ? 'step-active shadow-md shadow-primary-500/30' : 'step-pending bg-white border border-gray-200'
              }`}>
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide hidden sm:block ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="card shadow-sm">
        <div className="card-body p-8">
          
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Father's Name</label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mother's Name</label>
                  <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required pattern="[0-9]{10}" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} pattern="[0-9]{10}" className="form-input" />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">Full Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="form-input resize-none" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="form-input" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Course & Fees */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Select Course <span className="text-red-500">*</span></label>
                  <select name="courseId" value={formData.courseId} onChange={handleChange} required className="form-select focus:ring-primary-500 focus:border-primary-500 bg-blue-50/30">
                    <option value="">-- Choose a course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Assign Batch</label>
                  <select name="batchId" value={formData.batchId} onChange={handleChange} className="form-select">
                    <option value="">-- Let student choose later --</option>
                    {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.batchName} ({b.startTime} - {b.endTime})</option>)}
                  </select>
                </div>

                <div className="form-group md:col-span-2 mt-4 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Fee Structure Setup</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Total Course Fee (₹) <span className="text-red-500">*</span></label>
                  <input type="number" name="totalFee" value={formData.totalFee} onChange={handleChange} required min="0" className="form-input font-mono text-lg font-semibold text-gray-900" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Applicable Discount (₹)</label>
                  <input type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" className="form-input font-mono text-lg font-semibold text-green-600" />
                </div>

                 <div className="form-group md:col-span-2 mt-2 bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100 shadow-inner">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Final Payable Amount</span>
                  <span className="text-2xl font-bold font-mono text-primary-600">
                    ₹{Math.max(0, parseInt(formData.totalFee || "0") - parseInt(formData.discount || "0"))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Documents Upload */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-primary-50/50 p-6 rounded-2xl border border-primary-100 flex items-start gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Student Identity</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Please upload recent passport size photograph and local ID proof.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FileUpload 
                  label="Student Photograph"
                  bucket="student-documents"
                  folder="photos"
                  accept="image/*"
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
                />
                
                <FileUpload 
                  label="ID Proof (Aadhaar/Voter ID)"
                  bucket="student-documents"
                  folder="ids"
                  accept="image/*,application/pdf"
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, aadhaarUrl: url }))}
                />
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                 <FileText className="w-5 h-5 text-amber-600" />
                 <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Note:</strong> Uploaded documents will be linked to the student profile. Ensure files are clear and readable for verification.
                 </p>
              </div>
            </div>
          )}

        </div>

        {/* Form Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex items-center justify-between">
          <button 
            type="button" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className={`btn-ghost ${currentStep === 1 ? 'invisible' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary ml-auto shadow-md shadow-primary-500/20 px-6 py-2.5"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : currentStep === STEPS.length ? (
              <><Save className="w-4 h-4" /> Confirm Admission</>
            ) : (
              <>Next Step <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
