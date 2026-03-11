"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Clock, Calendar, Bookmark, Trash2, Filter } from "lucide-react";
import { formatDate, statusColor } from "@/lib/utils";

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState("");

  const [formData, setFormData] = useState({
    courseId: "",
    batchName: "",
    trainer: "",
    startTime: "",
    endTime: "",
    startDate: "",
    status: "UPCOMING",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = courseFilter ? `/api/batches?courseId=${courseFilter}` : `/api/batches`;
      const [batchRes, courseRes] = await Promise.all([
        fetch(url),
        fetch("/api/courses"),
      ]);
      setBatches(await batchRes.json());
      setCourses(await courseRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({ courseId: "", batchName: "", trainer: "", startTime: "", endTime: "", startDate: "", status: "UPCOMING" });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await fetch(`/api/batches/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Batch Scheduling</h1>
          <p className="page-subtitle">Manage class timings, active batches, and trainers</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Batch
        </button>
      </div>

      <div className="card p-4 flex gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select 
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="form-select w-full sm:w-64 py-2 text-sm"
        >
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner text-primary-600 w-10 h-10" />
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No batches scheduled</p>
          <button onClick={() => setModalOpen(true)} className="text-primary-600 hover:underline mt-2">
            Create a new batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.id} className="card hover:shadow-md transition-shadow">
              <div className="card-header bg-gray-50/50 border-b border-gray-100 flex justify-between items-center py-4">
                <span className={`badge ${statusColor(batch.status)}`}>{batch.status}</span>
                <button onClick={() => handleDelete(batch.id, batch.batchName)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{batch.batchName}</h3>
                <p className="text-xs font-semibold text-primary-600 mb-4">{batch.course?.name}</p>

                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50 mb-4 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{batch.startTime} - {batch.endTime}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center gap-2"><UserIcon className="w-4 h-4 text-orange-400" /> Trainer</span>
                    <span className="font-medium text-gray-900">{batch.trainer}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4 text-green-400" /> Starting Date</span>
                    <span className="font-medium text-gray-900">{formatDate(batch.startDate) || "TBD"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Students Enrolled</span>
                    <span className="font-bold text-gray-900">{batch._count.students}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Batch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Schedule New Batch</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto w-full">
              <div className="form-group">
                <label className="form-label">Course Mapping *</label>
                <select required value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} className="form-select">
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Batch Name / Code *</label>
                  <input required type="text" value={formData.batchName} onChange={e => setFormData({...formData, batchName: e.target.value})} className="form-input" placeholder="e.g. MORNING-MERN-1A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Trainer *</label>
                  <input required type="text" value={formData.trainer} onChange={e => setFormData({...formData, trainer: e.target.value})} className="form-input" placeholder="Trainer Name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="form-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="form-select">
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary">
                  {formLoading ? "Scheduling..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed lucide text icon usage above:
function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
