import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const batches = await prisma.batch.findMany({
      where: courseId ? { courseId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, name: true } },
        _count: { select: { students: true } },
      },
    });
    return NextResponse.json(batches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const batch = await prisma.batch.create({
      data: {
        courseId: body.courseId,
        batchName: body.batchName,
        trainer: body.trainer,
        startTime: body.startTime,
        endTime: body.endTime,
        startDate: body.startDate ? new Date(body.startDate) : null,
        status: body.status || "ACTIVE",
      },
      include: { course: { select: { name: true } } },
    });
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
