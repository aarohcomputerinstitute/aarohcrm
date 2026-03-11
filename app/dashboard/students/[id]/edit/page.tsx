"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Check, ChevronRight, FileText, Camera } from "lucide-react";
import FileUpload from "@/components/FileUpload";

const STEPS = [
  { id: 1, name: "Personal Details" },
  { id: 2, name: "Contact & Address" },
  { id: 3, name: "Documents Upload" }
];

export default function EditAdmissionPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
    
    photoUrl: "",
    aadhaarUrl: "",
  });

  useEffect(() => {
    fetch(`/api/students/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            fatherName: data.fatherName || "",
            motherName: data.motherName || "",
            dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
            gender: data.gender || "MALE",
            category: data.category || "GENERAL",
            mobile: data.mobile || "",
            whatsapp: data.whatsapp || "",
            email: data.email || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            photoUrl: data.photoUrl || "",
            aadhaarUrl: data.aadhaarUrl || "",
          });
        }
        setFetching(false);
      })
      .catch(err => {
        console.error("Failed to fetch student details", err);
        setFetching(false);
      });
  }, [params.id]);

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
      const res = await fetch(`/api/students/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/dashboard/students/${params.id}`);
        router.refresh();
      } else {
        alert("Failed to update student details");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/students/${params.id}`} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Admission Details</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update student personal and contact information</p>
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

          {/* STEP 3: Documents Upload */}
          {currentStep === 3 && (
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
                    <strong>Note:</strong> Uploaded documents will replace existing ones if a new file is uploaded.
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
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : currentStep === STEPS.length ? (
              <><Save className="w-4 h-4" /> Save Changes</>
            ) : (
              <>Next Step <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
