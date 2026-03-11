import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.feeTransaction.findUnique({
      where: { id: params.id },
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
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch receipt data" }, { status: 500 });
  }
}
