"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Calendar,
  GraduationCap,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EmitraDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/emitra/dashboard");
        const data = await res.json();
        setStats(data.stats);
        setRecentAdmissions(data.recentAdmissions);
      } catch (error) {
        console.error("Dashboard data load failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const cards = [
    {
      label: "Total Admissions",
      value: stats?.totalAdmissions || 0,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Commission",
      value: `₹${stats?.totalCommission || 0}`,
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Paid Commission",
      value: `₹${stats?.paidCommission || 0}`,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Pending Commission",
      value: `₹${stats?.pendingCommission || 0}`,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">e-Mitra Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Apne referrals aur commissions yahan track karein.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="card p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions */}
        <div className="lg:col-span-2 card shadow-sm overflow-hidden">
          <div className="card-header border-b border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Recent Referrals
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic">
                {recentAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{adm.firstName} {adm.lastName}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {adm.course?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {formatDate(adm.admissionDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-green-600">
                        ₹{adm.commission?.amount || 0}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentAdmissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                      Koi recent admission nahi mila.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Refer</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Naye student ki admission direct yahan se submit karein aur commission earn karein.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = "/dashboard/emitra/admissions/new"}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-5 h-5" />
            New Admission
          </button>
        </div>
      </div>
    </div>
  );
}
