"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Calendar,
  GraduationCap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  LayoutDashboard
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton, CardSkeleton, TableRowSkeleton } from "@/components/Skeleton";

export default function EmitraDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/partner/dashboard");
        const data = await res.json();
        setStats(data.stats);
        setRecentReferrals(data.recentReferrals);
      } catch (error) {
        console.error("Dashboard data load failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>

        <div className="card shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-12 bg-gray-50 border-b border-gray-100 px-4 flex items-center">
            <Skeleton className="h-4 w-40" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => <TableRowSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Refers (Inquiry)",
      value: stats?.totalReferrals || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Converted Admissions",
      value: stats?.totalAdmissions || 0,
      icon: GraduationCap,
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Apne center ki inquiries aur commissions yahan track karein.
          </p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => router.push("/dashboard/partner/admissions/new")}
              className="btn-primary shadow-lg shadow-primary-200 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-white/70" />
              New Inquiry
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="card p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
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

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Referrals */}
        <div className="card shadow-sm overflow-hidden border border-gray-100">
          <div className="card-header border-b border-gray-100 p-4 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Recent Inquiries (Refers)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{ref.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{formatDate(ref.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ref.course?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        ref.status === "CONVERTED" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {ref.status === "CONVERTED" ? "ADMISSION DONE" : "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ref.student?.commission ? (
                        <span className="text-sm font-bold text-green-600">
                          ₹{ref.student.commission.amount}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Auto-calc on conversion</span>
                      )}
                    </td>
                  </tr>
                ))}
                {recentReferrals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                      Abhi tak koi referral nahi kiya gaya hai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
