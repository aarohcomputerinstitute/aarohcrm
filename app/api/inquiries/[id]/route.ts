import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole, requireAuth } from "@/lib/api-auth";
import { updateInquirySchema, validateBody } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        course: true,
        counselor: { select: { id: true, name: true } },
        referrer: { select: { id: true, name: true, email: true } },
      },
    });
    if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Inquiry GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, updateInquirySchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { id } = await params;
    
    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        courseId: data.courseId || null,
        source: data.source,
        status: data.status,
        followupDate: data.followupDate ? new Date(data.followupDate) : null,
        notes: data.notes || null,
        counselorId: data.counselorId || null,
      },
    });
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Inquiry PUT error:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only Admin can delete inquiries
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Soft delete instead of permanent deletion
    await prisma.inquiry.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
