"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Search, 
  Users,
  Filter,
  Check,
  X,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCommissions = async () => {
    setLoading(true);
    const res = await fetch("/api/emitra/commissions");
    const data = await res.json();
    setCommissions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCommissions(); }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const res = await fetch(`/api/emitra/commissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchCommissions();
    } else {
      alert("Failed to update status");
    }
    setUpdatingId(null);
  };

  const filtered = commissions.filter(c => {
    const matchesSearch = 
      c.student?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.student?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-sm text-gray-500 mt-1">Sabhi e-Mitra centers ke commissions track aur pay karein.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-3 shadow-sm bg-white flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Student ya Center name..." 
            className="bg-transparent border-none outline-none flex-1 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="card p-3 shadow-sm bg-white flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            className="bg-transparent border-none outline-none flex-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">e-Mitra Center</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-xs">
                        {c.user?.name?.[0]}
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{c.user?.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{c.student?.firstName} {c.student?.lastName}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{c.student?.course?.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900">₹{c.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                      c.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(c.id, 'PAID')}
                          disabled={updatingId === c.id}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as Paid"
                        >
                          {updatingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(c.id, 'CANCELLED')}
                          disabled={updatingId === c.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Commission"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
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
