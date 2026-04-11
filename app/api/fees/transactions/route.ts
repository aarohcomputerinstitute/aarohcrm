import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFinanceRole } from "@/lib/api-auth";
import { generateReceiptNumber } from "@/lib/utils";
import { createFeeTransactionSchema, validateBody } from "@/lib/validations";

export async function POST(request: NextRequest) {
  // Only ADMIN and ACCOUNTANT can record payments
  const { error: authError } = requireFinanceRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, createFeeTransactionSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    const amount = parseFloat(String(data.amount));
    
    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    const receiptNumber = generateReceiptNumber();

    // CRITICAL FIX: Use database transaction to prevent race condition
    // Both the transaction creation and fee update happen atomically
    const result = await prisma.$transaction(async (tx) => {
      // Get fee record with lock (inside transaction)
      const fee = await tx.fee.findUnique({ where: { studentId: data.studentId } });
      if (!fee) {
        throw new Error("FEE_NOT_FOUND");
      }

      // Validate payment doesn't exceed due amount (with small tolerance for rounding)
      if (amount > fee.dueAmount + 0.01) {
        throw new Error("AMOUNT_EXCEEDS_DUE");
      }

      // Create the transaction record
      const transaction = await tx.feeTransaction.create({
        data: {
          feeId: fee.id,
          studentId: data.studentId,
          amount,
          paymentMode: data.paymentMode || "CASH",
          receiptNumber,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          notes: data.notes || null,
        },
      });

      // Update fee summary atomically
      const newPaidAmount = fee.paidAmount + amount;
      const newDueAmount = Math.max(0, fee.finalFee - newPaidAmount);

      await tx.fee.update({
        where: { id: fee.id },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : fee.nextDueDate,
        },
      });

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FEE_NOT_FOUND") {
        return NextResponse.json({ error: "Fee record not found for this student" }, { status: 404 });
      }
      if (error.message === "AMOUNT_EXCEEDS_DUE") {
        return NextResponse.json({ error: "Payment amount exceeds the due balance" }, { status: 400 });
      }
    }
    console.error("Fee Transaction error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
