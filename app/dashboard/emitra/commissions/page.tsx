"use client";

import { useEffect, useState } from "react";
import { CreditCard, Wallet, Clock, CheckCircle2, Search, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EmitraCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/emitra/commissions")
      .then(res => res.json())
      .then(data => {
        setCommissions(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = commissions.filter(c => 
    c.student?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    c.student?.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Commissions</h1>
          <p className="text-sm text-gray-500 mt-1">Apne referrals aur earned commissions ki list dekhein.</p>
        </div>
      </div>

      <div className="card p-4 shadow-sm bg-white flex items-center gap-4">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Student name se search karein..." 
          className="bg-transparent border-none outline-none flex-1 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 italic">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{c.student?.firstName} {c.student?.lastName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.student?.course?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-primary-600 text-lg">₹{c.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Koi commission record nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
