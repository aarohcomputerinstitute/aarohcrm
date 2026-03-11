import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        batchName: body.batchName,
        trainer: body.trainer,
        startTime: body.startTime,
        endTime: body.endTime,
        startDate: body.startDate ? new Date(body.startDate) : null,
        status: body.status,
        courseId: body.courseId,
      },
    });
    return NextResponse.json(batch);
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
    await prisma.batch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
