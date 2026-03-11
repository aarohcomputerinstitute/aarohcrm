import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AttendanceStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    const dateStr = searchParams.get("date");
    
    if (!batchId || !dateStr) {
      return NextResponse.json({ error: "batchId and date required" }, { status: 400 });
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(date.setHours(0,0,0,0));
    const endOfDay = new Date(date.setHours(23,59,59,999));

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
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { batchId, date: dateStr, records } = await request.json();
    
    if (!batchId || !dateStr || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const date = new Date(dateStr);

    // Filter out inactive students
    const activeStudents = await prisma.student.findMany({
      where: { batchId, isActive: true },
      select: { id: true }
    });
    const activeStudentIds = new Set(activeStudents.map(s => s.id));

    const validRecords = records.filter(r => activeStudentIds.has(r.studentId));

    // Upsert attendance using a transaction
    await prisma.$transaction(
      validRecords.map((record: { studentId: string; status: string }) => 
        prisma.attendance.upsert({
          where: {
            studentId_batchId_date: {
              studentId: record.studentId,
              batchId,
              date
            }
          },
          update: { status: record.status as AttendanceStatus },
          create: {
            studentId: record.studentId,
            batchId,
            date,
            status: record.status as AttendanceStatus
          }
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
