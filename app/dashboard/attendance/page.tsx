"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Save, CheckCircle2, Clock, Check, X, Ban } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function AttendancePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [selectedBatch, setSelectedBatch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/batches").then(res => res.json()).then(data => setBatches(data));
  }, []);

  const loadAttendance = async () => {
    if (!selectedBatch || !date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?batchId=${selectedBatch}&date=${date}`);
      const data = await res.json();
      
      setStudents(data.students || []);
      
      // Map existing attendance or default to PRESENT
      const newAttendance: Record<string, string> = {};
      data.students.forEach((student: any) => {
        newAttendance[student.id] = student.status || "PRESENT"; 
      });
      setAttendance(newAttendance);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch, date]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedBatch || students.length === 0) return;
    
    setSaving(true);
    const records = Object.keys(attendance).map(studentId => ({
      studentId,
      status: attendance[studentId]
    }));

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: selectedBatch, date, records }),
      });
      
      if (res.ok) {
        alert("Attendance saved successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const markAllAs = (status: string) => {
    const newAtt = { ...attendance };
    students.forEach(s => {
      newAtt[s.id] = status;
    });
    setAttendance(newAtt);
  };

  const getStatusColor = (status: string) => {
    if (status === "PRESENT") return "border-green-500 bg-green-50 text-green-700 font-semibold shadow-inner";
    if (status === "ABSENT") return "border-red-500 bg-red-50 text-red-700 font-semibold shadow-inner";
    if (status === "LATE") return "border-orange-500 bg-orange-50 text-orange-700 font-semibold shadow-inner";
    return "border-gray-200 bg-white text-gray-500 hover:bg-gray-50";
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Attendance</h1>
          <p className="page-subtitle">Mark and manage batch attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 border-0 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" /> Date
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="form-input shadow-sm"
              max={new Date().toISOString().split('T')[0]} 
            />
          </div>
          
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" /> Target Batch
            </label>
            <select 
              value={selectedBatch} 
              onChange={e => setSelectedBatch(e.target.value)}
              className="form-select shadow-sm"
            >
              <option value="">-- Choose a batch to load students --</option>
              {batches.filter(b => b.status === 'ACTIVE').map(b => (
                <option key={b.id} value={b.id}>{b.batchName} ({b.course?.name}) - {b.startTime} to {b.endTime}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="spinner text-primary-600 w-10 h-10" />
        </div>
      )}

      {/* No batch selected / No students */}
      {!loading && selectedBatch && students.length === 0 && (
        <div className="card py-16 text-center border-0 shadow-sm text-gray-500">
          <Ban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-gray-900 text-lg">No active students in this batch.</p>
          <p className="text-sm mt-1">Enroll students into this batch first.</p>
        </div>
      )}

      {/* Attendance Grid */}
      {!loading && students.length > 0 && (
        <div className="card overflow-hidden shadow-sm border-0 flex flex-col">
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => markAllAs('PRESENT')} className="text-xs px-3 py-1.5 font-semibold text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 transition-colors flex-1 sm:flex-none">Mark All Present</button>
              <button onClick={() => markAllAs('ABSENT')} className="text-xs px-3 py-1.5 font-semibold text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors flex-1 sm:flex-none">Mark All Absent</button>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Total Students: <span className="font-bold text-gray-900">{students.length}</span>
            </p>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th className="text-center w-64 lg:w-96">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const currentStatus = attendance[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0 border border-primary-200 shadow-sm">
                            {getInitials(`${student.firstName} ${student.lastName}`)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{student.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 shadow-sm p-1 gap-1 w-full max-w-[300px] mx-auto bg-gray-50/50">
                          <button
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`flex flex-col items-center justify-center py-2 px-1 flex-1 rounded-md border text-xs transition-all ${
                              currentStatus === 'PRESENT' ? getStatusColor('PRESENT') : getStatusColor('none')
                            }`}
                          >
                            <Check className="w-4 h-4 mb-1" />
                            Present
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`flex flex-col items-center justify-center py-2 px-1 flex-1 rounded-md border text-xs transition-all ${
                              currentStatus === 'LATE' ? getStatusColor('LATE') : getStatusColor('none')
                            }`}
                          >
                            <Clock className="w-4 h-4 mb-1" />
                            Late
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`flex flex-col items-center justify-center py-2 px-1 flex-1 rounded-md border text-xs transition-all ${
                              currentStatus === 'ABSENT' ? getStatusColor('ABSENT') : getStatusColor('none')
                            }`}
                          >
                            <X className="w-4 h-4 mb-1" />
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary px-8 py-2.5 shadow-md shadow-primary-500/20 text-sm"
            >
              {saving ? <div className="flex items-center gap-2"><div className="spinner w-4 h-4 shrink-0" /> Saving...</div> : <div className="flex items-center gap-2"><Save className="w-4 h-4" /> Finalize Attendance</div>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
