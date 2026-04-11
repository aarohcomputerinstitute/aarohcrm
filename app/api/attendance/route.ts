import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AttendanceStatus } from "@prisma/client";
import { requireRole } from "@/lib/api-auth";
import { saveAttendanceSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  // ADMIN, COUNSELOR, TRAINER can view attendance
  const { error: authError } = requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER"]);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    const dateStr = searchParams.get("date");
    
    if (!batchId || !dateStr) {
      return NextResponse.json({ error: "batchId and date are required" }, { status: 400 });
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await prisma.attendance.findMany({
      where: {
        batchId,
        date: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, photoUrl: true } }
      }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // ADMIN and TRAINER can mark attendance
  const { error: authError } = requireRole(request, ["ADMIN", "TRAINER"]);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, saveAttendanceSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    const date = new Date(data.date);

    // Verify batch exists
    const batch = await prisma.batch.findUnique({ where: { id: data.batchId } });
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Filter out inactive students
    const activeStudents = await prisma.student.findMany({
      where: { batchId: data.batchId, isActive: true },
      select: { id: true }
    });
    const activeStudentIds = new Set(activeStudents.map(s => s.id));

    const validRecords = data.records.filter(r => activeStudentIds.has(r.studentId));

    // Upsert attendance using a transaction
    await prisma.$transaction(
      validRecords.map((record) => 
        prisma.attendance.upsert({
          where: {
            studentId_batchId_date: {
              studentId: record.studentId,
              batchId: data.batchId,
              date
            }
          },
          update: { status: record.status as AttendanceStatus },
          create: {
            studentId: record.studentId,
            batchId: data.batchId,
            date,
            status: record.status as AttendanceStatus
          }
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
