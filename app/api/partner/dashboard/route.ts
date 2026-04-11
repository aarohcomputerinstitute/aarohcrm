import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  // e-Mitra and ADMIN can view this dashboard
  const { user, error: authError } = requireRole(request, ["ADMIN", "EMITRA"]);
  if (authError) return authError;

  try {
    const userId = user.userId;

    const [
      aggregateStats,
      paidStats,
      pendingStats,
      totalReferrals,
      totalAdmissions,
      recentReferrals,
      recentAdmissions,
    ] = await Promise.all([
      prisma.commission.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { userId, status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { userId, status: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.inquiry.count({
        where: { referredById: userId, isActive: true },
      }),
      prisma.student.count({
        where: { referredById: userId, isActive: true },
      }),
      prisma.inquiry.findMany({
        where: { referredById: userId, isActive: true },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { name: true } },
          student: {
            include: {
              commission: { select: { amount: true, status: true, percentage: true } }
            }
          }
        },
      }),
      prisma.student.findMany({
        where: { referredById: userId, isActive: true },
        take: 5,
        orderBy: { admissionDate: "desc" },
        include: {
          course: { select: { name: true } },
          commission: { select: { amount: true, status: true, percentage: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalReferrals,
        totalAdmissions,
        totalCommission: aggregateStats._sum.amount || 0,
        paidCommission: paidStats._sum.amount || 0,
        pendingCommission: pendingStats._sum.amount || 0,
      },
      recentReferrals,
      recentAdmissions,
    });
  } catch (error) {
    console.error("e-Mitra Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
