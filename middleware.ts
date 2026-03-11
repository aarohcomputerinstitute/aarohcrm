import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/login", "/api/auth/login"];

// Admin-only pages - only ADMIN role can access
const adminOnlyPaths = [
  "/dashboard/settings/users",
  "/dashboard/settings",
];

// Routes only accessible to ADMIN and ACCOUNTANT
const financeOnlyPaths = [
  "/dashboard/fees",
  "/dashboard/reports",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  const role = payload.role;

  // ---- ROLE-BASED ACCESS CONTROL ----

  // Admin-only page check
  if (adminOnlyPaths.some((p) => pathname.startsWith(p))) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    }
  }

  // Finance page check (Admin + Accountant only)
  // Trainers and Counselors cannot view fee reports
  if (
    pathname.startsWith("/dashboard/reports") &&
    !["ADMIN", "ACCOUNTANT"].includes(role)
  ) {
    return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
  }

  // Inject user info in headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-name", payload.name);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
