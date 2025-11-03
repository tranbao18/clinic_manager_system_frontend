// src/app/api/auth/validate/route.ts
// Endpoint để validate token với backend (optional - có thể không cần)
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { valid: false, error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Gọi một endpoint protected ở backend để validate
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
    
    // Dùng endpoint getAccount hoặc employee (đều require auth)
    const validateRes = await fetch(`${backendUrl}/api/auth/account/dummy`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);

    // Nếu 401/403 thì token invalid, nếu OK hoặc 404 thì token valid
    if (!validateRes) {
      return NextResponse.json(
        { valid: false, error: "Backend unavailable" },
        { status: 503 }
      );
    }

    // Token valid nếu không phải 401/403
    const isValid = validateRes.status !== 401 && validateRes.status !== 403;
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}

