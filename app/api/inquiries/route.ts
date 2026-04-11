import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { createInquirySchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { user, error: authError } = requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT", "EMITRA"]);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const counselorId = searchParams.get("counselorId");
    const referredById = searchParams.get("referredById");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { isActive: true };
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;
    if (counselorId) where.counselorId = counselorId;
    
    // e-Mitra (pointed center) can ONLY see their own referrals
    if (user.role === "EMITRA") {
      where.referredById = user.userId;
    } else if (referredById) {
      where.referredById = referredById;
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { id: true, name: true } },
          counselor: { select: { id: true, name: true } },
          referrer: { select: { id: true, name: true } },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return NextResponse.json({ inquiries, total, page, limit });
  } catch (error) {
    console.error("Inquiries GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT", "EMITRA"]);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, createInquirySchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name.trim(),
        mobile: data.mobile,
        email: data.email || null,
        courseId: data.courseId || null,
        source: user.role === "EMITRA" ? "REFERRAL" : (data.source || "WALK_IN"),
        status: data.status || "NEW",
        followupDate: data.followupDate ? new Date(data.followupDate) : null,
        notes: data.notes || null,
        counselorId: data.counselorId || null,
        feeOffered: data.feeOffered ? parseFloat(String(data.feeOffered)) : null,
        // e-Mitra (pointed center) auto-set as referrer
        referredById: user.role === "EMITRA" ? user.userId : (data.referredById || null),
      },
      include: { course: true, referrer: true },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Inquiries POST error:", error);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
