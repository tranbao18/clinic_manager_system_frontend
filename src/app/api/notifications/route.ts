// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";

// 📋 GET - Lấy danh sách thông báo
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const read = searchParams.get("read");

    const authHeaders = await getAuthHeaderServer();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeaders.Authorization) {
      headers.Authorization = authHeaders.Authorization;
    }

    const url = `${API_URL}/api/notifications${read ? `?read=${read}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      let errorDetail = "";
      try {
        const errorData = await res.json();
        errorDetail = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch {
        const text = await res.text();
        errorDetail = text || `HTTP ${res.status} ${res.statusText}`;
      }

      console.error("External API (GET notifications) error:", {
        status: res.status,
        statusText: res.statusText,
        detail: errorDetail,
        url,
      });

      return NextResponse.json(
        { error: "Không thể lấy thông báo", detail: errorDetail },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET /api/notifications exception:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
