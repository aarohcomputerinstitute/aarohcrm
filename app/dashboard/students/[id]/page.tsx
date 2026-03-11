"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Phone, MapPin, Mail, CreditCard, Calendar, Contact, BookOpen, GraduationCap, FileText } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export default function StudentDetail({ params }: { params: { id: string } }) {
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
      <div className="flex items-center justify-center h-full">
        <div className="spinner w-8 h-8 text-primary-600" />
      </div>
    );
  }

  if (!student || student.error) {
    return <div className="text-center py-12 text-gray-500">Student not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students" className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage details, fees, and attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Contact info column */}
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-primary-700 text-3xl font-bold shadow-lg ring-4 ring-white -mt-12 mb-4 overflow-hidden border border-gray-100">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  getInitials(`${student.firstName} ${student.lastName}`)
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-500 font-mono text-sm mt-1 mb-4">{student.studentId}</p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${student.fee?.dueAmount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {student.fee?.dueAmount > 0 ? `${formatCurrency(student.fee.dueAmount)} Due` : 'Fees Cleared'}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" /> {student.mobile}
              </div>
              {student.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" /> {student.email}
                </div>
              )}
              {student.address && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                  <span>{student.address}, {student.city}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-gray-50/50 border-b border-gray-100 py-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" /> Academic Details
              </h3>
            </div>
            <div className="card-body p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Enrolled Course</p>
                <p className="text-sm font-semibold text-gray-900">{student.course?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Batch Assigned</p>
                <p className="text-sm font-semibold text-gray-900">{student.batch?.batchName || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Admission Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(student.admissionDate)}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" /> Uploaded Documents
              </h3>
            </div>
            <div className="card-body p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identity Proof</p>
                   {student.aadhaarUrl ? (
                     <a href={student.aadhaarUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors group">
                       <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-red-600" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-medium text-gray-900 truncate">ID_Proof.pdf</p>
                         <p className="text-xs text-primary-600 group-hover:underline">View Document &rarr;</p>
                       </div>
                     </a>
                   ) : (
                     <p className="text-sm text-gray-400 italic">No ID proof uploaded</p>
                   )}
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Passport Photo</p>
                   {student.photoUrl ? (
                     <a href={student.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors group">
                       <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                          <img src={student.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-medium text-gray-900 truncate">Student_Photo.jpg</p>
                         <p className="text-xs text-primary-600 group-hover:underline">View Image &rarr;</p>
                       </div>
                     </a>
                   ) : (
                     <p className="text-sm text-gray-400 italic">No photo uploaded</p>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details column */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="card">
            <div className="card-header border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Contact className="w-5 h-5 text-primary-500" /> Personal Details
              </h3>
            </div>
            <div className="card-body p-6 grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Date of Birth</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(student.dob) || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Gender</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{student.gender?.toLowerCase() || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Father's Name</p>
                <p className="text-sm font-semibold text-gray-900">{student.fatherName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Mother's Name</p>
                <p className="text-sm font-semibold text-gray-900">{student.motherName || "-"}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" /> Fee Summary
              </h3>
              <Link href={`/dashboard/fees/${student.id}`} className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg">
                Manage Fees &rarr;
              </Link>
            </div>
            <div className="card-body p-6">
              {student.fee ? (
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Fee</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(student.fee.finalFee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(student.fee.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(student.fee.dueAmount)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No fee record found.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" /> Recent Attendance
              </h3>
              <Link href="/dashboard/attendance" className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg">
                Mark Attendance &rarr;
              </Link>
            </div>
            <div className="card-body p-0">
              {student.attendance?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {student.attendance.slice(0, 5).map((record: any) => (
                    <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-700">{formatDate(record.date)}</span>
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${record.status === 'PRESENT' ? 'bg-green-100 text-green-700' : record.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No attendance records found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
