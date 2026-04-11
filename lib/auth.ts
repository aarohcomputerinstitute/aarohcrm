import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// SECURITY: No fallback — app MUST have a proper JWT secret set
const jwtSecretStr = process.env.JWT_SECRET;
if (!jwtSecretStr || jwtSecretStr.length < 32) {
  console.error(
    "FATAL: JWT_SECRET environment variable is missing or too short (min 32 chars). Set a strong secret."
  );
}
const JWT_SECRET = new TextEncoder().encode(
  jwtSecretStr || "MISSING_SECRET_DO_NOT_USE_IN_PRODUCTION"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")  // 8 hours - auto logout for security
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(payload: JWTPayload): Promise<void> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",   // SECURITY: Upgraded from "lax" to prevent CSRF
    maxAge: 60 * 60 * 8,  // 8 hours - auto logout
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
