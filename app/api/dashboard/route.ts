import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const { error: authError } = requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT"]);
  if (authError) return authError;

  try {
    const [
      totalInquiries,
      todayInquiries,
      totalStudents,
      totalCourses,
      totalBatches,
      feeData,
      recentInquiries,
      recentAdmissions,
      counselorStats,
    ] = await Promise.all([
      prisma.inquiry.count({ where: { isActive: true } }),
      prisma.inquiry.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.student.count({ where: { isActive: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.batch.count({ where: { status: "ACTIVE" } }),
      prisma.fee.aggregate({
        _sum: { paidAmount: true, dueAmount: true },
      }),
      prisma.inquiry.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { 
          course: { select: { name: true } },
          counselor: { select: { name: true } }
        },
      }),
      prisma.student.findMany({
        where: {
          isActive: true,
          admissionDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: { admissionDate: true },
        orderBy: { admissionDate: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "COUNSELOR", isActive: true },
        select: {
          id: true,
          name: true,
          _count: {
            select: { inquiries: true }
          }
        },
        orderBy: { inquiries: { _count: "desc" } },
        take: 5,
      }),
    ]);

    // Process monthly admissions
    const monthlyAdmissionsMap: Record<string, number> = {};
    for (const student of recentAdmissions) {
      const date = new Date(student.admissionDate);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyAdmissionsMap[month] = (monthlyAdmissionsMap[month] || 0) + 1;
    }

    const monthlyAdmissions = Object.entries(monthlyAdmissionsMap).map(([month, count]) => ({
      month,
      count,
    }));

    return NextResponse.json({
      stats: {
        totalInquiries,
        todayInquiries,
        totalStudents,
        totalCourses,
        activeBatches: totalBatches,
        feesCollected: feeData._sum.paidAmount || 0,
        feesDue: feeData._sum.dueAmount || 0,
      },
      recentInquiries,
      counselors: counselorStats.map(c => ({
        id: c.id,
        name: c.name,
        inquiryCount: c._count.inquiries
      })),
      monthlyAdmissions,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
