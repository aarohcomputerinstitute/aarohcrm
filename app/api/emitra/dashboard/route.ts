import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [stats, recentAdmissions] = await Promise.all([
      prisma.commission.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.student.findMany({
        where: { referredById: userId },
        take: 5,
        orderBy: { admissionDate: "desc" },
        include: {
          course: { select: { name: true } },
          commission: { select: { amount: true, status: true } },
        },
      }),
    ]);

    const paidCommission = await prisma.commission.aggregate({
      where: { userId, status: "PAID" },
      _sum: { amount: true },
    });

    const pendingCommission = await prisma.commission.aggregate({
      where: { userId, status: "PENDING" },
      _sum: { amount: true },
    });

    const totalReferrals = await prisma.inquiry.count({
      where: { referredById: userId },
    });

    const totalAdmissions = await prisma.student.count({
      where: { referredById: userId },
    });

    const recentReferrals = await prisma.inquiry.findMany({
      where: { referredById: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { name: true } },
        student: {
          include: {
            commission: { select: { amount: true, status: true } }
          }
        }
      },
    });

    return NextResponse.json({
      stats: {
        totalReferrals,
        totalAdmissions,
        totalCommission: stats._sum.amount || 0,
        paidCommission: paidCommission._sum.amount || 0,
        pendingCommission: pendingCommission._sum.amount || 0,
      },
      recentReferrals,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
