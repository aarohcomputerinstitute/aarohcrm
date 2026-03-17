import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isAdminRequest(request: NextRequest): boolean {
  const role = request.headers.get("x-user-role");
  return role === "ADMIN";
}

// DELETE /api/users/[id] - Admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  try {
    const { id } = params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email === "aarohcomputerinstitute@gmail.com") {
      return NextResponse.json({ error: "Cannot delete the primary admin account" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Users DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Admin only - Update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive, role, name, email } = body;

    const data: any = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (role !== undefined) data.role = role;
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Users PATCH error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
