"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, Loader2, Phone, MapPin, Mail, Globe } from "lucide-react";

export default function PrintAdmissionForm({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setStudent(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
        <p className="text-gray-500 font-medium whitespace-nowrap uppercase tracking-widest text-xs">Preparing Admission Form...</p>
      </div>
    );
  }

  if (!student || student.error) {
    return <div className="p-8 text-center text-red-500 font-bold uppercase">Student not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none print:max-w-none">

        {/* Print Action Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center print:hidden">
          <button
            onClick={() => window.history.back()}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 uppercase tracking-widest"
          >
            &larr; Back to Profile
          </button>
          <button
            onClick={() => window.print()}
            className="bg-primary-600 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2 text-sm uppercase"
          >
            <Printer className="w-4 h-4" />
            Print Form
          </button>
        </div>

        {/* Professional Form Layout */}
        <div className="p-[15mm] print:p-[10mm] relative">

          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-primary-600 pb-8 mb-10">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-primary-600 tracking-tighter uppercase">AAROH</h1>
              <p className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                Tech and AI Institute
              </p>
              <div className="pt-4 space-y-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary-500" /> Niwaru Link Rd, Kalwar Rd, Govindpura, Jhotwara, Jaipur 302012</p>
                <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-primary-500" /> +91 9828658887</p>
                <p className="flex items-center gap-2"><Globe className="w-3 h-3 text-primary-500" /> www.aarohcomputerclasses.in</p>
              </div>
            </div>
            {/* Student Photo Section */}
            <div className="w-[35mm] h-[45mm] border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 overflow-hidden print:border-solid print:border-gray-200">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">Affix <br /> Photograph <br /> Here</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 border-2 border-gray-900 inline-block px-8 py-2 uppercase tracking-[0.3em] bg-gray-50">
              Admission Form
            </h2>
            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Enrollment No: <span className="text-gray-900 font-mono text-xs">{student.studentId}</span></p>
          </div>

          {/* Form Content */}
          <div className="space-y-10">

            {/* 1. PERSONAL DETAILS */}
            <section>
              <h3 className="text-xs font-black text-white bg-primary-600 px-4 py-1.5 uppercase tracking-[0.1em] mb-4 inline-block">1. Personal Information</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-l-2 border-gray-100 pl-6">
                <DetailField label="Full Name" value={`${student.firstName} ${student.lastName}`} bold />
                <DetailField label="Date of Birth" value={formatDate(student.dob)} />
                <DetailField label="Father's Name" value={student.fatherName || "____________________"} />
                <DetailField label="Mother's Name" value={student.motherName || "____________________"} />
                <DetailField label="Gender" value={student.gender} />
                <DetailField label="Category" value={student.category || "General"} />
              </div>
            </section>

            {/* 2. CONTACT DETAILS */}
            <section>
              <h3 className="text-xs font-black text-white bg-primary-600 px-4 py-1.5 uppercase tracking-[0.1em] mb-4 inline-block">2. Contact Details</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-l-2 border-gray-100 pl-6">
                <DetailField label="Mobile Number" value={student.mobile} />
                <DetailField label="WhatsApp Number" value={student.whatsapp || "____________________"} />
                <DetailField label="Email Address" value={student.email || "____________________"} />
                <div className="col-span-2">
                  <DetailField label="Permanent Address" value={student.address} />
                </div>
                <DetailField label="City" value={student.city} />
                <DetailField label="Pincode" value={student.pincode || "_______"} />
              </div>
            </section>

            {/* 3. ACADEMIC DETAILS */}
            <section>
              <h3 className="text-xs font-black text-white bg-primary-600 px-4 py-1.5 uppercase tracking-[0.1em] mb-4 inline-block">3. Course Details</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-l-2 border-gray-100 pl-6">
                <DetailField label="Enrolled Course" value={student.course?.name} bold />
                <DetailField label="Batch Name" value={student.batch?.batchName || "Not Assigned"} />
                <DetailField label="Admission Date" value={formatDate(student.admissionDate)} />
                <DetailField label="Duration" value={`${student.course?.duration || "-"} Months`} />
              </div>
            </section>

            {/* 4. DECLARATION */}
            <section className="pt-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-[10px] font-black text-gray-900 uppercase mb-2">Declaration:</h4>
                <p className="text-[9px] text-gray-500 leading-relaxed text-justify">
                  I hereby declare that all the information provided above is true and correct to the best of my knowledge. I agree to abide by the rules and regulations of the institute. I understand that the fee once paid is non-refundable and non-transferable under any circumstances.
                </p>
              </div>
            </section>

          </div>

          {/* Signature Blocks */}
          <div className="grid grid-cols-3 gap-8 mt-24">
            <div className="space-y-12">
              <div className="border-t border-gray-900 pt-2 text-center">
                <p className="text-[10px] font-black text-gray-900 uppercase">Student's Signature</p>
              </div>
            </div>
            <div className="space-y-12">
              <div className="border-t border-gray-900 pt-2 text-center">
                <p className="text-[10px] font-black text-gray-900 uppercase">Parent's Signature</p>
              </div>
            </div>
            <div className="space-y-12">
              <div className="border-t border-gray-900 pt-2 text-center">
                <p className="text-[10px] font-black text-gray-900 uppercase">Director / Principal</p>
              </div>
            </div>
          </div>

          {/* Footer Logo/Stamp */}
          <div className="absolute bottom-10 right-10 opacity-5 pointer-events-none rotate-[-15deg]">
            <h4 className="text-6xl font-black border-4 border-gray-900 p-4">AAROH ACADEMY</h4>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, footer, nav, .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function DetailField({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-sm ${bold ? 'font-black text-gray-900' : 'font-bold text-gray-700'} border-b border-gray-100 pb-1`}>
        {value}
      </p>
    </div>
  );
}
