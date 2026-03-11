import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search } },
        ],
      };
    }

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mobile: true,
            photoUrl: true,
            course: { select: { name: true } },
            batch: { select: { batchName: true } },
          },
        },
        transactions: { orderBy: { paymentDate: "desc" }, take: 1 },
      },
      orderBy: { dueAmount: "desc" },
    });

    return NextResponse.json(fees);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nextDueDate } = body;

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      },
    });

    return NextResponse.json(fee);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 });
  }
}
