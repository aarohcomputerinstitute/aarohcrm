import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole, requireAuth } from "@/lib/api-auth";
import { createBatchSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { error: authError } = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const batches = await prisma.batch.findMany({
      where: courseId ? { courseId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, name: true } },
        _count: { select: { students: true } },
      },
    });
    return NextResponse.json(batches);
  } catch (error) {
    console.error("Batches GET error:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, createBatchSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const batch = await prisma.batch.create({
      data: {
        courseId: data.courseId,
        batchName: data.batchName.trim(),
        trainer: data.trainer.trim(),
        startTime: data.startTime,
        endTime: data.endTime,
        startDate: data.startDate ? new Date(data.startDate) : null,
        status: data.status || "ACTIVE",
      },
      include: { course: { select: { name: true } } },
    });
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Batches POST error:", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
