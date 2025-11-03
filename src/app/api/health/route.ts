// src/app/api/health/route.ts
// Endpoint để check server status
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    timestamp: Date.now() 
  });
}

