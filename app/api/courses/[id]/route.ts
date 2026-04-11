import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole } from "@/lib/api-auth";
import { updateCourseSchema, validateBody } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, updateCourseSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { id } = await params;
    
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.duration !== undefined) updateData.duration = data.duration.trim();
    if (data.fee !== undefined) updateData.fee = parseFloat(String(data.fee));
    if (data.description !== undefined) updateData.description = data.description || null;

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(course);
  } catch (error) {
    console.error("Course PUT error:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
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
    
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Soft-delete
    await prisma.course.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course DELETE error:", error);
    return NextResponse.json({ error: "Failed to deactivate course" }, { status: 500 });
  }
}
