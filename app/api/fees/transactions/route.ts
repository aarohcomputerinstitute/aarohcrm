import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateReceiptNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, amount, paymentMode, notes, nextDueDate } = body;

    // Get fee record
    const fee = await prisma.fee.findUnique({ where: { studentId } });
    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
    }

    const receiptNumber = generateReceiptNumber();

    // Create transaction
    const transaction = await prisma.feeTransaction.create({
      data: {
        feeId: fee.id,
        studentId,
        amount: parseFloat(amount),
        paymentMode: paymentMode || "CASH",
        receiptNumber,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        notes: notes || null,
      },
    });

    // Update fee summary
    const newPaidAmount = fee.paidAmount + parseFloat(amount);
    await prisma.fee.update({
      where: { id: fee.id },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: fee.finalFee - newPaidAmount,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : fee.nextDueDate,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
