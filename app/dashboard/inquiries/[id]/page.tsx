"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap, Calendar, Phone, Mail, User, BookOpen, Clock, StickyNote, Trash2 } from "lucide-react";
import { formatDate, statusColor } from "@/lib/utils";

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/inquiries/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setInquiry(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      const res = await fetch(`/api/inquiries/${params.id}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/inquiries");
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/inquiries/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inquiry, status }),
      });
      if (res.ok) {
        setInquiry({ ...inquiry, status });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner w-8 h-8 text-primary-600" />
      </div>
    );
  }

  if (!inquiry || inquiry.error) {
    return <div className="text-center py-12 text-gray-500">Inquiry not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inquiries" className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inquiry Details</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-bold text-primary-600 tracking-wider">REF NO: #{inquiry.inquiryNo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleDelete} className="btn-danger bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          {inquiry.status !== "CONVERTED" && (
            <Link href={`/dashboard/admissions/new?inquiryId=${inquiry.id}`} className="btn-primary">
              <GraduationCap className="w-4 h-4" />
              Convert to Admission
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Student Information
              </h2>
            </div>
            <div className="card-body p-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-gray-900">{inquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Mobile Number</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" /> {inquiry.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-400" /> {inquiry.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Interested Course</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-gray-400" /> {inquiry.course?.name || "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Assigned Counselor</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" /> {inquiry.counselor?.name || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Fee Offered</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 text-primary-600">
                    ₹ {inquiry.feeOffered || "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary-500" />
                Counselor Notes
              </h2>
            </div>
            <div className="card-body p-6">
              {inquiry.notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.notes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No notes provided for this inquiry.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status & Workflow */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-md font-semibold text-gray-900">Current Status</h2>
            </div>
            <div className="card-body p-5">
              <div className="mb-6">
                <span className={`badge px-3 py-1.5 text-sm ${statusColor(inquiry.status)}`}>
                  {inquiry.status.replace("_", " ")}
                </span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleUpdateStatus("FOLLOWUP")} className="btn-secondary text-xs justify-center py-2">Follow-up</button>
                  <button onClick={() => handleUpdateStatus("NOT_INTERESTED")} className="btn-secondary text-xs justify-center py-2 text-red-600">Not Interested</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-md font-semibold text-gray-900">Tracking Info</h2>
            </div>
            <div className="card-body p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Inquiry Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(inquiry.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Next Follow-up</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(inquiry.followupDate) || "Not scheduled"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Source / Referrer</p>
                  <p className="text-sm font-medium text-gray-900">
                    {inquiry.referrer ? (
                      <span className="flex flex-col">
                        <span className="text-primary-700 font-bold">{inquiry.referrer.name}</span>
                        <span className="text-[10px] text-gray-400 italic">Partner (e-Mitra)</span>
                      </span>
                    ) : (
                      inquiry.source.replace("_", " ")
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
