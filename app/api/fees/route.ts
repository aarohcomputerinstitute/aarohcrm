import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFinanceRole } from "@/lib/api-auth";
import { updateFeeSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  // Only Admin and Accountant can view fee data
  const { error: authError } = requireFinanceRole(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
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
    console.error("Fees GET error:", error);
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { error: authError } = requireFinanceRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, updateFeeSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    const existing = await prisma.fee.findUnique({ where: { id: data.id } });
    if (!existing) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
    }

    const fee = await prisma.fee.update({
      where: { id: data.id },
      data: {
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
      },
    });

    return NextResponse.json(fee);
  } catch (error) {
    console.error("Fees PATCH error:", error);
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 });
  }
}
