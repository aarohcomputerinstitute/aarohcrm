"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ArrowRight, Calendar, Users, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdmissionsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmittedStudents = async () => {
    setLoading(true);
    try {
      // Re-use students API logic here, just standard listing prioritizing recent
      const res = await fetch(`/api/students`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmittedStudents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admission Management</h1>
          <p className="page-subtitle">Track new admissions and completed enrollments</p>
        </div>
        <Link href="/dashboard/admissions/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Admission
        </Link>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Registration Date</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Enrolled Course</th>
                <th>Assigned Batch</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="spinner text-primary-600" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-gray-300" />
                      <p>No recent admissions found.</p>
                      <Link href="/dashboard/admissions/new" className="text-primary-600 font-medium hover:underline">Create first admission</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td className="whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(student.admissionDate)}
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                        {student.studentId}
                      </span>
                    </td>
                    <td>
                      <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500">{student.mobile}</p>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100 border-opacity-50">
                        {student.course?.name || "Not selected"}
                      </span>
                    </td>
                    <td>
                      {student.batch ? (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{student.batch.batchName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <Link 
                        href={`/dashboard/students/${student.id}`}
                        className="btn-secondary px-3 py-1.5 shadow-sm hover:shadow text-xs"
                      >
                        Profile
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
