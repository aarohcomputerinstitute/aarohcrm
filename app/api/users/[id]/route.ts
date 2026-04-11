import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { updateUserSchema, validateBody } from "@/lib/validations";

// DELETE /api/users/[id] - Admin only (soft-delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email === "aarohcomputerinstitute@gmail.com") {
      return NextResponse.json({ error: "Cannot delete the primary admin account" }, { status: 403 });
    }

    // Soft-delete instead of hard-delete to prevent cascade issues
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Users DELETE error:", error);
    return NextResponse.json({ error: "Failed to deactivate user" }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Admin only - Update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = requireAdmin(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, updateUserSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { id } = await params;
    
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deactivating the primary admin
    if (existing.email === "aarohcomputerinstitute@gmail.com" && data.isActive === false) {
      return NextResponse.json({ error: "Cannot deactivate the primary admin account" }, { status: 403 });
    }

    // Build update data — only include fields that were provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
    if (data.commissionRate !== undefined) updateData.commissionRate = parseFloat(String(data.commissionRate));

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true, commissionRate: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Users PATCH error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
