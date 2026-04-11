import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole, requireAuth } from "@/lib/api-auth";
import { generateCertificateNumber } from "@/lib/utils";
import { createCertificateSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { error: authError } = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    
    const where = studentId ? { studentId } : {};

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        student: { 
          select: { firstName: true, lastName: true, photoUrl: true, courseLevel: true }
        },
        course: { select: { name: true } },
      },
      orderBy: { issuedAt: "desc" }
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Certificates GET error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Only ADMIN and staff can issue certificates
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, createCertificateSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    // Verify student exists
    const student = await prisma.student.findUnique({ where: { id: data.studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if certificate already exists
    const existing = await prisma.certificate.findUnique({ where: { studentId: data.studentId } });
    if (existing) {
      return NextResponse.json({ error: "Certificate already generated for this student" }, { status: 400 });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const certificateNo = generateCertificateNumber();

    const certificate = await prisma.certificate.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        completionDate: new Date(data.completionDate),
        certificateNo,
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } },
      }
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Certificates POST error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
