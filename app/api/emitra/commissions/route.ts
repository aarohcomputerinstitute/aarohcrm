import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const role = headersList.get("x-user-role");

    // If Admin, they might want to see ALL commissions (later)
    // For now, let's filter by the logged in user
    const where: any = {};
    if (role === "EMITRA") {
      where.userId = userId;
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
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
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
