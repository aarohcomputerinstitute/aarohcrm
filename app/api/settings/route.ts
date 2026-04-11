import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const settingsSchema = z.object({
  instituteName: z.string().min(1, "Institute name is required").max(100),
  registrationNo: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().max(500).optional().nullable(),
  currency: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  twoFactor: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    let settings = await prisma.setting.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.setting.create({
        data: { id: "global" }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { error: authError } = requireAdmin(request);
  if (authError) return authError;

  const result = await validateBody(request, settingsSchema);
  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error || "Invalid request" }, { status: 400 });
  }

  try {
    const settings = await prisma.setting.upsert({
      where: { id: "global" },
      update: {
        instituteName: result.data.instituteName,
        registrationNo: result.data.registrationNo,
        phone: result.data.phone,
        email: result.data.email,
        address: result.data.address,
        currency: result.data.currency,
        timezone: result.data.timezone,
        twoFactor: result.data.twoFactor,
      },
      create: {
        id: "global",
        instituteName: result.data.instituteName,
        registrationNo: result.data.registrationNo,
        phone: result.data.phone,
        email: result.data.email,
        address: result.data.address,
        currency: result.data.currency || "INR",
        timezone: result.data.timezone || "IST",
        twoFactor: result.data.twoFactor || false,
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
