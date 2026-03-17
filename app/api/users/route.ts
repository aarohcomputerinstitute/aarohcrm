import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// Helper to check if the incoming request is from an ADMIN
function isAdminRequest(request: NextRequest): boolean {
  const role = request.headers.get("x-user-role");
  return role === "ADMIN";
}

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER", "EMITRA"] } },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // ---- Admin Only ----
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, isActive: true },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Users POST error details:", error);
    return NextResponse.json({ 
      error: "Failed to create user", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
