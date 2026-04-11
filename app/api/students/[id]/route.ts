import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole, requireAuth } from "@/lib/api-auth";
import { updateStudentSchema, validateBody } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        course: true,
        batch: true,
        fee: { include: { transactions: { orderBy: { paymentDate: "desc" } } } },
        attendance: { orderBy: { date: "desc" }, take: 30 },
        certificate: true,
        commission: true,
        referredBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    console.error("Student GET error:", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only ADMIN and COUNSELOR can edit students
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, updateStudentSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { id } = await params;
    
    // Check student exists
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        dob: data.dob ? new Date(data.dob) : null,
        gender: data.gender || null,
        category: data.category || null,
        mobile: data.mobile,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        courseId: data.courseId || null,
        batchId: data.batchId || null,
        courseLevel: data.courseLevel || null,
        photoUrl: data.photoUrl || null,
        aadhaarUrl: data.aadhaarUrl || null,
      },
    });
    return NextResponse.json(student);
  } catch (error) {
    console.error("Student PUT error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only ADMIN can deactivate students
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Soft delete — keep data for audit
    await prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student DELETE error:", error);
    return NextResponse.json({ error: "Failed to deactivate student" }, { status: 500 });
  }
}
