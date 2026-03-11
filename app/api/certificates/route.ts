import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCertificateNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    
    const where = studentId ? { studentId } : {};

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        student: { 
          select: { firstName: true, lastName: true, photoUrl: true, courseLevel: true }
        }
      },
      orderBy: { issuedAt: "desc" }
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId, completionDate } = await request.json();
    
    // Check if certificate already exists
    const existing = await prisma.certificate.findUnique({ where: { studentId } });
    if (existing) {
      return NextResponse.json({ error: "Certificate already generated" }, { status: 400 });
    }

    const certificateNo = generateCertificateNumber();

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        courseId,
        completionDate: new Date(completionDate),
        certificateNo,
      },
      include: {
        student: { select: { firstName: true, lastName: true } }
      }
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
