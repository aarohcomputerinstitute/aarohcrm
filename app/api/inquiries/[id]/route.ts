import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        name: body.name,
        mobile: body.mobile,
        email: body.email || null,
        courseId: body.courseId || null,
        source: body.source,
        status: body.status,
        followupDate: body.followupDate ? new Date(body.followupDate) : null,
        notes: body.notes || null,
        counselorId: body.counselorId || null,
      },
    });
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.inquiry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
