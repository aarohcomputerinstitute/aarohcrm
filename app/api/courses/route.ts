import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffRole, requireAuth } from "@/lib/api-auth";
import { createCourseSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  // Any authenticated user can view courses
  const { error: authError } = requireAuth(request);
  if (authError) return authError;

  try {
    const courses = await prisma.course.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { students: true, batches: true } },
      },
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Only ADMIN can create courses
  const { error: authError } = requireStaffRole(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, createCourseSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    const course = await prisma.course.create({
      data: {
        name: data.name.trim(),
        duration: data.duration.trim(),
        fee: parseFloat(String(data.fee)),
        description: data.description || null,
      },
    });
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Courses POST error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
