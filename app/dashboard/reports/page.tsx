"use client";

import { useEffect, useState } from "react";
import { Download, FileText, ChevronDown, CheckSquare, Users, CreditCard, Banknote, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    fees: [],
    students: [],
    inquiries: [],
    batches: []
  });

  useEffect(() => {
    // Fetch aggregated data
    const fetchAll = async () => {
      try {
        const [fees, students, inquiries, batches] = await Promise.all([
          fetch("/api/fees").then(res => res.json()),
          fetch("/api/students").then(res => res.json()),
          fetch("/api/inquiries").then(res => res.json()),
          fetch("/api/batches").then(res => res.json()),
        ]);

        setData({
          fees: fees || [],
          students: students.students || [],
          inquiries: inquiries.inquiries || [],
          batches: batches || []
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Calculate some simple stats based on loaded data
  const totalRevenue = data.fees.reduce((acc: number, f: any) => acc + (f.paidAmount || 0), 0);
  const totalDues = data.fees.reduce((acc: number, f: any) => acc + (f.dueAmount || 0), 0);
  
  const inquiryConversion = data.inquiries.length > 0 
    ? Math.round((data.inquiries.filter((i:any) => i.status === 'CONVERTED').length / data.inquiries.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Export and analyze institute performance data</p>
        </div>
        <button className="btn-secondary" onClick={() => window.print()}>
          <Download className="w-4 h-4" /> Export All
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner text-primary-600 w-10 h-10" />
        </div>
      ) : (
        <>
          {/* Quick Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="card p-5 border-l-4 border-l-green-500">
               <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Banknote className="w-4 h-4" /> Total Collected</p>
               <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
             </div>
             <div className="card p-5 border-l-4 border-l-red-500">
               <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Outstanding Dues</p>
               <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalDues)}</h3>
             </div>
             <div className="card p-5 border-l-4 border-l-blue-500">
               <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Active Admissions</p>
               <h3 className="text-2xl font-bold text-gray-900">{data.students.length}</h3>
             </div>
             <div className="card p-5 border-l-4 border-l-purple-500">
               <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><FileText className="w-4 h-4" /> Lead Conversion</p>
               <h3 className="text-2xl font-bold text-gray-900">{inquiryConversion}%</h3>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Fee Defaulters Report */}
            <div className="card shadow-sm border-0">
              <div className="card-header border-b border-gray-100 flex justify-between items-center py-4">
                <h3 className="text-lg font-bold text-gray-900">Fee Defaulters List</h3>
                <span className="badge bg-red-100 text-red-700">{data.fees.filter((f:any)=>f.dueAmount>0).length} Students</span>
              </div>
              <div className="table-wrapper max-h-96 overflow-y-auto">
                <table className="table">
                  <thead className="sticky top-0 bg-white">
                    <tr><th className="bg-gray-50">Student</th><th className="bg-gray-50">Course</th><th className="bg-gray-50 text-right">Due Amount</th></tr>
                  </thead>
                  <tbody>
                    {data.fees.filter((f: any) => f.dueAmount > 0)
                      .sort((a:any, b:any) => b.dueAmount - a.dueAmount)
                      .slice(0, 10)
                      .map((fee: any) => (
                      <tr key={fee.id}>
                        <td className="font-semibold text-gray-900">{fee.student.firstName} {fee.student.lastName}</td>
                        <td className="text-sm text-gray-500">{fee.student.course?.name || "-"}</td>
                        <td className="text-right font-mono font-bold text-red-600">{formatCurrency(fee.dueAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Batch Occupancy Report */}
            <div className="card shadow-sm border-0">
              <div className="card-header border-b border-gray-100 flex justify-between items-center py-4">
                <h3 className="text-lg font-bold text-gray-900">Active Batch Status</h3>
                <span className="badge bg-blue-100 text-blue-700">{data.batches.length} Batches</span>
              </div>
              <div className="table-wrapper max-h-96 overflow-y-auto">
                <table className="table">
                  <thead className="sticky top-0 bg-white">
                    <tr><th className="bg-gray-50">Batch Code</th><th className="bg-gray-50">Trainer</th><th className="bg-gray-50 text-right">Enrolled</th></tr>
                  </thead>
                  <tbody>
                    {data.batches.filter((b:any) => b.status === 'ACTIVE').map((batch: any) => (
                      <tr key={batch.id}>
                        <td>
                          <p className="font-semibold text-gray-900">{batch.batchName}</p>
                          <p className="text-xs text-gray-400">{batch.startTime}</p>
                        </td>
                        <td className="text-sm text-gray-500">{batch.trainer}</td>
                        <td className="text-right font-bold text-indigo-600">{batch._count.students}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}
