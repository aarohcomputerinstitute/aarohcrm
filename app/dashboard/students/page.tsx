"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Phone, Mail, GraduationCap } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, courseRes] = await Promise.all([
        fetch(`/api/students?search=${searchFilter}&courseId=${courseFilter}`),
        fetch("/api/courses"),
      ]);

      const studentData = await studentRes.json();
      const courseData = await courseRes.json();

      setStudents(studentData.students || []);
      setCourses(courseData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceTimeout = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, courseFilter]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Directory</h1>
          <p className="page-subtitle">Manage all enrolled students</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, mobile, or email..." 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="w-full sm:w-auto flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="form-select w-full sm:w-48 py-2 text-sm"
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner text-primary-600 w-10 h-10" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No students found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map((student) => (
            <Link key={student.id} href={`/dashboard/students/${student.id}`} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
              {/* Fee status badge indicator */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${student.fee?.dueAmount > 0 ? "bg-red-500" : "bg-green-500"}`} />
              
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto flex items-center justify-center text-primary-700 text-2xl font-bold shadow-sm mb-4 ring-4 ring-white">
                  {getInitials(`${student.firstName} ${student.lastName}`)}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1 pr-1">{student.studentId}</p>
              </div>

              <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{student.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{student.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate font-medium text-indigo-700">{student.course?.name || "N/A"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Temporary import for icon below:
import { BookOpen } from "lucide-react";
