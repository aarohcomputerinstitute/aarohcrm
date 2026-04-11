"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ArrowRight, Phone, Clock } from "lucide-react";
import { formatDate, statusColor } from "@/lib/utils";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [counselorFilter, setCounselorFilter] = useState("");
  const [counselors, setCounselors] = useState<any[]>([]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let url = `/api/inquiries?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (counselorFilter) url += `counselorId=${counselorFilter}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, counselorFilter]);

  useEffect(() => {
    fetch("/api/users").then(res => res.json()).then(data => setCounselors(data || []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inquiry Management</h1>
          <p className="page-subtitle">Track and manage prospective students</p>
        </div>
        <Link href="/dashboard/inquiries/add" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Inquiry
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or mobile..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="w-full sm:w-auto flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select w-full sm:w-48 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="FOLLOWUP">Follow-up</option>
              <option value="CONVERTED">Converted</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
            <select 
              value={counselorFilter}
              onChange={(e) => setCounselorFilter(e.target.value)}
              className="form-select w-full sm:w-48 py-2 text-sm"
            >
              <option value="">All Counselors</option>
              {counselors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID No.</th>
                <th>Date</th>
                <th>Student Details</th>
                <th>Interested Course</th>
                <th>Counselor</th>
                <th>Follow-up</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="spinner text-primary-600" />
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td className="whitespace-nowrap text-xs font-mono font-bold text-gray-500">
                      #{inq.inquiryNo}
                    </td>
                    <td className="whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inq.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{inq.name}</p>
                        {inq.referrer && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase">Referred</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3" />
                        {inq.mobile}
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {inq.course?.name || "Not selected"}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-700">
                        {inq.counselor?.name || <span className="text-gray-400">Unassigned</span>}
                      </span>
                    </td>
                    <td>
                      {inq.followupDate ? (
                        <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(inq.followupDate)}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${statusColor(inq.status)}`}>
                        {inq.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <Link 
                        href={`/dashboard/inquiries/${inq.id}`}
                        className="btn-secondary px-3 py-1.5 shadow-sm hover:shadow text-xs"
                      >
                        Details
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
