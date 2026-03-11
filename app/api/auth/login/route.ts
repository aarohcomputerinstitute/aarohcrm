import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Login route hit: POST /api/auth/login");
  try {
    const body = await request.json();
    console.log("Request body received:", body);
    
    return NextResponse.json({ 
      success: true, 
      message: "Login route is reachable",
      debug: {
        body
      }
    });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  console.log("Login route hit: GET /api/auth/login");
  return NextResponse.json({ message: "Login route is alive (GET)" });
}
