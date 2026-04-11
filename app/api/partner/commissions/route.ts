import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  // ADMIN sees all commissions, e-Mitra sees only their own
  const { user, error: authError } = requireRole(request, ["ADMIN", "ACCOUNTANT", "EMITRA"]);
  if (authError) return authError;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (user.role === "EMITRA") {
      where.userId = user.userId;
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        student: {
          include: {
            course: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(commissions);
  } catch (error) {
    console.error("Commissions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch commissions" }, { status: 500 });
  }
}
