import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status, paymentMode, transactionId } = await request.json();
    const { id } = params;

    const commission = await prisma.commission.update({
      where: { id },
      data: { 
        status,
        paymentMode: status === "PAID" ? paymentMode : null,
        transactionId: status === "PAID" ? transactionId : null,
        paidAt: status === "PAID" ? new Date() : null
      },
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update commission" }, { status: 500 });
  }
}
