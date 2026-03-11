"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, CreditCard, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fees?search=${search}`);
      setFees(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFees();
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">Track student fee collections, installments, and dues</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search student by name or mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student info</th>
                <th>Course / Batch</th>
                <th>Fee Summary</th>
                <th>Status</th>
                <th>Next Due</th>
                <th>Last Payment</th>
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
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CreditCard className="w-8 h-8 text-gray-300" />
                      <p>No fee records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                          {getInitials(`${fee.student.firstName} ${fee.student.lastName}`)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {fee.student.firstName} {fee.student.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{fee.student.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-gray-900">{fee.student.course?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{fee.student.batch?.batchName || "No batch"}</p>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs w-32">
                          <span className="text-gray-500">Total:</span> 
                          <span className="font-medium">{formatCurrency(fee.finalFee)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs w-32">
                          <span className="text-gray-500">Paid:</span> 
                          <span className="text-green-600 font-medium">{formatCurrency(fee.paidAmount)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {fee.dueAmount > 0 ? (
                        <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {formatCurrency(fee.dueAmount)} Due
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cleared
                        </div>
                      )}
                    </td>
                    <td className="w-40">
                      <div className="flex flex-col gap-1">
                        {fee.dueAmount > 0 ? (
                          <div className="group relative">
                            {fee.nextDueDate ? (
                              <div className={`flex flex-col ${new Date(fee.nextDueDate) < new Date() ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                                <input 
                                  type="date" 
                                  value={new Date(fee.nextDueDate).toISOString().split('T')[0]} 
                                  onChange={async (e) => {
                                    const newDate = e.target.value;
                                    try {
                                      const res = await fetch('/api/fees', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: fee.id, nextDueDate: newDate })
                                      });
                                      if (res.ok) fetchFees();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-sm font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 cursor-pointer outline-none transition-colors p-0.5"
                                />
                                {new Date(fee.nextDueDate) < new Date() && (
                                  <span className="text-[10px] font-bold uppercase tracking-tight flex items-center gap-0.5 mt-0.5">
                                    <AlertCircle className="w-2.5 h-2.5" /> Overdue
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <input 
                                  type="date" 
                                  onChange={async (e) => {
                                    const newDate = e.target.value;
                                    try {
                                      const res = await fetch('/api/fees', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: fee.id, nextDueDate: newDate })
                                      });
                                      if (res.ok) fetchFees();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-xs text-gray-400 font-medium italic bg-transparent border-b border-dashed border-gray-300 hover:border-gray-400 focus:text-gray-900 focus:border-primary-500 cursor-pointer outline-none transition-all p-0.5"
                                  placeholder="Set Date"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {fee.transactions && fee.transactions.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(fee.transactions[0].amount)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(fee.transactions[0].paymentDate)}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No payments yet</span>
                      )}
                    </td>
                    <td>
                      <Link 
                        href={`/dashboard/fees/${fee.student.id}`}
                        className="btn-secondary px-3 py-1.5 shadow-sm hover:shadow text-xs"
                      >
                        Manage
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
