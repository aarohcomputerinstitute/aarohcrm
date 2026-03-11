import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const counselorId = searchParams.get("counselorId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;
    if (counselorId) where.counselorId = counselorId;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { id: true, name: true } },
          counselor: { select: { id: true, name: true } },
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
  try {
    const body = await request.json();
    const inquiry = await prisma.inquiry.create({
      data: {
        name: body.name,
        mobile: body.mobile,
        email: body.email || null,
        courseId: body.courseId || null,
        source: body.source || "WALK_IN",
        status: body.status || "NEW",
        followupDate: body.followupDate ? new Date(body.followupDate) : null,
        notes: body.notes || null,
        counselorId: body.counselorId || null,
        feeOffered: body.feeOffered ? parseFloat(body.feeOffered) : null,
      },
      include: { course: true },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Inquiries POST error:", error);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
