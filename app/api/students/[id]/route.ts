import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      },
    });
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
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
    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        fatherName: body.fatherName || null,
        motherName: body.motherName || null,
        dob: body.dob ? new Date(body.dob) : null,
        gender: body.gender || null,
        category: body.category || null,
        mobile: body.mobile,
        whatsapp: body.whatsapp || null,
        email: body.email || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        pincode: body.pincode || null,
        courseId: body.courseId || null,
        batchId: body.batchId || null,
        courseLevel: body.courseLevel || null,
        photoUrl: body.photoUrl || null,
        aadhaarUrl: body.aadhaarUrl || null,
      },
    });
    return NextResponse.json(student);
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
    await prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
