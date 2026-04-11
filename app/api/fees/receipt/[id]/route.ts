import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFinanceRole } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireFinanceRole(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const transaction = await prisma.feeTransaction.findUnique({
      where: { id },
      include: {
        fee: {
          include: {
            student: {
              include: {
                course: true,
                batch: true,
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Receipt GET error:", error);
    return NextResponse.json({ error: "Failed to fetch receipt data" }, { status: 500 });
  }
}
