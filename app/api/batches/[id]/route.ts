import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole } from "@/lib/api-auth";
import { updateBatchSchema, validateBody } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, updateBatchSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { id } = await params;
    
    const existing = await prisma.batch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (data.batchName !== undefined) updateData.batchName = data.batchName.trim();
    if (data.trainer !== undefined) updateData.trainer = data.trainer.trim();
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.courseId !== undefined) updateData.courseId = data.courseId;

    const batch = await prisma.batch.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(batch);
  } catch (error) {
    console.error("Batch PUT error:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    const existing = await prisma.batch.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } }
    });
    if (!existing) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Prevent deletion if batch has active students
    if (existing._count.students > 0) {
      // Set to COMPLETED instead of deleting
      await prisma.batch.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json({ success: true, message: "Batch marked as completed (has students)" });
    }

    await prisma.batch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete batch" }, { status: 500 });
  }
}
