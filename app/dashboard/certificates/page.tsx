"use client";

import { useEffect, useState } from "react";
import { Search, Award, Printer, Download, CheckCircle2, Trophy, Loader2, Link as LinkIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: "",
    issueDate: new Date().toISOString().split('T')[0],
    grade: "A",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certsRes, studentsRes] = await Promise.all([
        fetch("/api/certificates"),
        fetch("/api/students")
      ]);
      setCertificates(await certsRes.json());
      setStudents((await studentsRes.json()).students.filter((s:any) => s.status === 'ENROLLED' || s.status === 'COMPLETED')); // Only enrolled/completed students can get certs
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormOpen(false);
        fetchData();
        setFormData({studentId: "", issueDate: new Date().toISOString().split('T')[0], grade: "A"});
      } else {
        alert("Failed to generate certificate or already exists.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate Management</h1>
          <p className="page-subtitle">Generate and verify course completion certificates</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary">
          <Trophy className="w-4 h-4" /> Add Certificate
        </button>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Certificate Number</th>
                <th>Student Info</th>
                <th>Course Completed</th>
                <th>Issue Date & Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr>
                 <td colSpan={5} className="text-center py-12">
                   <div className="spinner text-primary-600" />
                 </td>
               </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    <Award className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="font-medium text-gray-900 text-lg">No certificates issued yet</p>
                  </td>
                </tr>
              ) : (
                certificates.map(cert => (
                  <tr key={cert.id}>
                    <td>
                      <span className="font-mono text-xs font-bold bg-primary-50 text-primary-700 px-2.5 py-1 rounded shadow-sm border border-primary-100 flex items-center w-fit gap-1.5 pt-[5px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {cert.certificateNumber}
                      </span>
                    </td>
                    <td>
                      <p className="font-bold text-gray-900">
                        {cert.student.firstName} {cert.student.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{cert.student.studentId}</p>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">
                        {cert.student.course?.name || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Date</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(cert.issueDate)}</span>
                        </div>
                        <div className="flex flex-col border-l pl-4 border-gray-200">
                          <span className="text-xs text-gray-500">Grade</span>
                          <span className="text-sm font-bold text-indigo-700">{cert.grade}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                         <button className="btn-secondary px-3 py-1.5 text-xs shadow-sm hover:shadow" onClick={() => window.print()}>
                            <Printer className="w-3.5 h-3.5" /> Print
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Issue Certificate Modal */}
       {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-500" />
                Generate Certificate
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-5">
              
              <div className="form-group">
                <label className="form-label">Select Student *</label>
                <select 
                  required 
                  value={formData.studentId} 
                  onChange={e => setFormData({...formData, studentId: e.target.value})} 
                  className="form-select font-medium"
                >
                  <option value="">-- Choose student who completed a course --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.studentId}) - {s.course?.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Note: Only currently enrolled or completed students are eligible for a certificate.</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Achievement Grade *</label>
                  <select required value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="form-select font-semibold text-indigo-700">
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Satisfactory)</option>
                  </select>
                </div>
              </div>

              {formData.studentId && (
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 mt-2">
                  <p className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-1">Preview Info</p>
                  <p className="text-sm font-medium text-gray-800">
                    This will generate a certificate for <span className="font-bold">{students.find(s=>s.id === formData.studentId)?.firstName}</span> for the course <span className="font-bold">{students.find(s=>s.id === formData.studentId)?.course?.name}</span> with grade <span className="font-bold">{formData.grade}</span>.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary shadow-md shadow-primary-500/20">
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
