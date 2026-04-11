import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
