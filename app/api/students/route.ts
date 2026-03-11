import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const batchId = searchParams.get("batchId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };
    if (courseId) where.courseId = courseId;
    if (batchId) where.batchId = batchId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { admissionDate: "desc" },
        include: {
          course: { select: { id: true, name: true } },
          batch: { select: { id: true, batchName: true } },
          fee: { select: { dueAmount: true, paidAmount: true, finalFee: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({ students, total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const student = await prisma.student.create({
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
        parentName: body.parentName || null,
        parentOccupation: body.parentOccupation || null,
        parentMobile: body.parentMobile || null,
        aadhaarNumber: body.aadhaarNumber || null,
        aadhaarUrl: body.aadhaarUrl || null,
        photoUrl: body.photoUrl || null,
        courseId: body.courseId || null,
        batchId: body.batchId || null,
        courseLevel: body.courseLevel || null,
        batchPreference: body.batchPreference || null,
        admissionDate: body.admissionDate ? new Date(body.admissionDate) : new Date(),
        inquiryId: body.inquiryId || null,
      },
    });

    // Auto-create fee record if course fee provided
    if (body.courseId && body.totalFee) {
      const finalFee = parseFloat(body.totalFee) - (parseFloat(body.discount) || 0);
      await prisma.fee.create({
        data: {
          studentId: student.id,
          totalFee: parseFloat(body.totalFee),
          discount: parseFloat(body.discount) || 0,
          finalFee,
          paidAmount: 0,
          dueAmount: finalFee,
        },
      });
    }

    // Mark inquiry as converted if linked
    if (body.inquiryId) {
      await prisma.inquiry.update({
        where: { id: body.inquiryId },
        data: { status: "CONVERTED" },
      });
    }

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
