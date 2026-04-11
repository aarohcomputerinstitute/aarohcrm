import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { updateCommissionSchema, validateBody } from "@/lib/validations";

// PATCH /api/emitra/commissions/[id] — Pay or cancel commission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only ADMIN can update commission status (pay/cancel)
  const { error: authError } = requireAdmin(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, updateCommissionSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { id } = await params;

    // Verify commission exists
    const existing = await prisma.commission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    }

    // Prevent modifying already paid commissions
    if (existing.status === "PAID" && data.status !== "PAID") {
      return NextResponse.json(
        { error: "Cannot modify a commission that has already been paid" },
        { status: 400 }
      );
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: { 
        status: data.status,
        paymentMode: data.status === "PAID" ? (data.paymentMode || null) : null,
        transactionId: data.status === "PAID" ? (data.transactionId || null) : null,
        paidAt: data.status === "PAID" ? new Date() : null,
        notes: data.notes || existing.notes,
      },
      include: {
        user: { select: { name: true, email: true } },
        student: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error("Commission PATCH error:", error);
    return NextResponse.json({ error: "Failed to update commission" }, { status: 500 });
  }
}
