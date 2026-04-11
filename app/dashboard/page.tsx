"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  CalendarDays,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { formatCurrency, statusColor } from "@/lib/utils";
import { Skeleton, CardSkeleton, TableRowSkeleton } from "@/components/Skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalInquiries: number;
  todayInquiries: number;
  totalStudents: number;
  totalCourses: number;
  activeBatches: number;
  feesCollected: number;
  feesDue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
          setRecentInquiries(data.recentInquiries || []);
          setCounselors(data.counselors || []);
          setChartData(data.monthlyAdmissions || []);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2 shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-12 bg-gray-50 border-b border-gray-100 px-4 flex items-center">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="p-8">
               <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
          <div className="card shadow-sm border border-gray-100 overflow-hidden">
             <div className="h-12 bg-gray-50 border-b border-gray-100 px-4 flex items-center">
               <Skeleton className="h-4 w-40" />
             </div>
             {[1, 2, 3, 4, 5].map((i) => <TableRowSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents || 0, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Today's Inquiries", value: stats?.todayInquiries || 0, icon: UserPlus, color: "text-green-600", bg: "bg-green-100" },
    { label: "Total Inquiries", value: stats?.totalInquiries || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Active Batches", value: stats?.activeBatches || 0, icon: CalendarDays, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Fees Collected", value: formatCurrency(stats?.feesCollected || 0), icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Pending Fees", value: formatCurrency(stats?.feesDue || 0), icon: TrendingUp, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome to Aaroh Institute CRM. Here's what's happening today.</p>
        </div>
        <Link href="/dashboard/inquiries/add" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          New Inquiry
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Admissions Trend (Last 6 Months)
            </h2>
          </div>
          <div className="card-body h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    cursor={{ stroke: "#F3F4F6", strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Admissions"
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    dot={{ fill: "#4F46E5", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No recent admission data to display
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              Recent Inquiries
            </h2>
          </div>
          <div className="card-body p-0">
            {recentInquiries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{inq.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inq.course?.name || "No Course"} • {inq.mobile}
                      </p>
                      {inq.counselor && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-700 font-bold shrink-0">
                            {inq.counselor.name[0]}
                          </div>
                          <span className="text-[10px] font-bold text-primary-600 uppercase tracking-tight">
                            {inq.counselor.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge ${statusColor(inq.status)}`}>
                        {inq.status}
                      </span>
                      <Link 
                        href={`/dashboard/inquiries/${inq.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        View <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No recent inquiries.
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <Link 
              href="/dashboard/inquiries" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 block text-center w-full"
            >
              View All Inquiries
            </Link>
          </div>
        </div>

        {/* Counselors Performance */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              Counselor Performance
            </h2>
          </div>
          <div className="card-body p-0">
            {counselors.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {counselors.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Counselor</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{c.inquiryCount}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Inquiries</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No active counselors found.
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
             <p className="text-[10px] text-center text-gray-400 font-medium italic">
                Counselors are ranked by total inquiries handled.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
