import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdmin, requireRole } from "@/lib/api-auth";
import { createUserSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  // Only ADMIN can list all users. Counselors can see user names for dropdowns.
  const { user, error: authError } = requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT"]);
  if (authError) return authError;

  try {
    // Non-admin users only get basic info (for dropdown selectors)
    const selectFields = user.role === "ADMIN"
      ? { id: true, name: true, email: true, role: true, phone: true, isActive: true, commissionRate: true, createdAt: true }
      : { id: true, name: true, role: true, isActive: true };

    const users = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER", "EMITRA"] } },
      select: selectFields,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Only ADMIN can create users
  const { error: authError } = requireAdmin(request);
  if (authError) return authError;

  const { data, error: validationError } = await validateBody(request, createUserSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: data.role,
        phone: data.phone || null,
        commissionRate: data.commissionRate !== undefined ? parseFloat(String(data.commissionRate)) : 10,
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, commissionRate: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
