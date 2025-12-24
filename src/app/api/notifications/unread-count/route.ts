// src/app/api/notifications/unread-count/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";

// 🔢 GET - Lấy số lượng thông báo chưa đọc
export async function GET(req: Request) {
  try {
    const authHeaders = await getAuthHeaderServer();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeaders.Authorization) {
      headers.Authorization = authHeaders.Authorization;
    }

    const url = `${API_URL}/api/notifications/unread-count`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      // Trả về 0 nếu có lỗi
      return NextResponse.json({ count: 0 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET /api/notifications/unread-count exception:", err);
    return NextResponse.json({ count: 0 });
  }
}
