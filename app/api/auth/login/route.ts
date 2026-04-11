import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";
import { loginSchema, validateBody } from "@/lib/validations";

// ---- Simple In-Memory Rate Limiter ----
// Max 5 attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterMs = WINDOW_MS - (now - entry.firstAttempt);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count, retryAfterMs: 0 };
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  loginAttempts.forEach((value, key) => {
    if (now - value.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  });
}, 30 * 60 * 1000);

export async function POST(request: NextRequest) {
  // ---- Rate Limit Check ----
  const ip = getRateLimitKey(request);
  const { allowed, retryAfterMs } = checkRateLimit(ip);

  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60000);
    return NextResponse.json(
      { error: `Too many login attempts. Please wait ${minutes} minute(s) and try again.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
          "X-RateLimit-Limit": String(MAX_ATTEMPTS),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ---- Validate Input ----
  const { data, error: validationError } = await validateBody(request, loginSchema);
  if (validationError || !data) {
    return NextResponse.json({ error: validationError || "Invalid request" }, { status: 400 });
  }

  try {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Please contact administrator." },
        { status: 403 }
      );
    }

    // Successful login — reset rate limit for this IP
    resetRateLimit(ip);

    // Set session
    try {
      await setSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        commissionRate: user.commissionRate || (user.role === 'EMITRA' ? 10 : undefined),
      });
    } catch (sessionError) {
      console.error("Session Setting Error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
