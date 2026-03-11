import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
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
      prisma.inquiry.count(),
      prisma.inquiry.count({
        where: {
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
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { 
          course: { select: { name: true } },
          counselor: { select: { name: true } }
        },
      }),
      prisma.student.findMany({
        where: {
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

    // Process monthly admissions in JS for database compatibility
    const monthlyAdmissionsMap = (recentAdmissions as any[]).reduce((acc: any, student) => {
      const date = new Date(student.admissionDate);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyAdmissions = Object.entries(monthlyAdmissionsMap).map(([month, count]) => ({
      month,
      count: BigInt(count as number),
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
      monthlyAdmissions: monthlyAdmissions.map((m) => ({
        month: m.month,
        count: Number(m.count),
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
