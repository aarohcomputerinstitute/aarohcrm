"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, Clock, Users, Calendar, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    fee: "",
    description: "",
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({ name: "", duration: "", fee: "", description: "" });
        fetchCourses();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE" });
      fetchCourses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Management</h1>
          <p className="page-subtitle">Add and configure institute courses</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner text-primary-600 w-10 h-10" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No courses available</p>
          <button onClick={() => setModalOpen(true)} className="text-primary-600 hover:underline mt-2">
            Create your first course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course.id} className={`card ${!course.isActive ? "opacity-60 grayscale" : ""} flex flex-col`}>
              <div className="h-2 bg-primary-500 rounded-t-xl"></div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center border border-primary-100 shrink-0">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  {!course.isActive && <span className="badge bg-red-100 text-red-700">Inactive</span>}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{course.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
                  {course.description || "No description provided."}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Duration</span>
                    <span className="font-medium text-gray-900">{course.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500 flex items-center gap-1.5"><Users className="w-4 h-4" /> Enrolled</span>
                    <span className="font-medium text-gray-900">{course._count.students}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Batches</span>
                    <span className="font-medium text-gray-900">{course._count.batches}</span>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-mono text-lg font-bold text-primary-600">
                    {formatCurrency(course.fee)}
                  </span>
                  {course.isActive && (
                    <button 
                      onClick={() => handleDelete(course.id, course.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Deactivate course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Add New Course</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" placeholder="e.g. Full Stack Web Development" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="form-input" placeholder="e.g. 6 Months" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Fee (₹) *</label>
                  <input required type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} className="form-input" placeholder="e.g. 15000" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-input resize-none" rows={3} placeholder="Brief details about the curriculum..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary">
                  {formLoading ? "Saving..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
