// ============================================================
// AAROH CRM — API Route Authorization Helper
// Ensures EVERY API handler checks role before processing.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import type { Role } from "./types";

interface RequestUser {
  userId: string;
  role: Role;
  name: string;
}

/**
 * Extract authenticated user info from middleware-injected headers.
 * Returns null if headers are missing (should never happen if middleware is configured).
 */
export function getRequestUser(request: NextRequest): RequestUser | null {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role") as Role | null;
  const name = request.headers.get("x-user-name");

  if (!userId || !role) return null;

  return { userId, role, name: name || "Unknown" };
}

/**
 * Check if the request user has one of the allowed roles.
 * Returns a 403 response if unauthorized, or null if authorized.
 */
export function requireRole(
  request: NextRequest,
  allowedRoles: Role[]
): { user: RequestUser; error: null } | { user: null; error: NextResponse } {
  const user = getRequestUser(request);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: `Unauthorized: Requires ${allowedRoles.join(" or ")} role` },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Shorthand: Allow only ADMIN
 */
export function requireAdmin(request: NextRequest) {
  return requireRole(request, ["ADMIN"]);
}

/**
 * Shorthand: Allow ADMIN + ACCOUNTANT (finance operations)
 */
export function requireFinanceRole(request: NextRequest) {
  return requireRole(request, ["ADMIN", "ACCOUNTANT"]);
}

/**
 * Shorthand: Allow ADMIN + COUNSELOR (student/inquiry operations)
 */
export function requireStaffRole(request: NextRequest) {
  return requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT"]);
}

/**
 * Shorthand: Any authenticated user
 */
export function requireAuth(request: NextRequest) {
  return requireRole(request, ["ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER", "EMITRA"]);
}
