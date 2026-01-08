// KẾ THỪA 
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.BACKEND_URL || "http://localhost:5050/api/users";

/**
 * GET /api/users
 *  - Nếu có ?employee_id=... → proxy đến API backend thật
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get("employee_id");

    const headers = await getAuthHeaderServer();

    const res = await fetch(
      `${API_URL}${employee_id ? `?employee_id=${employee_id}` : ""}`,
      {
        headers, // gắn token vô header
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Không thể tải danh sách tài khoản" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}

/**
 * POST /api/users
 *  - Tạo tài khoản mới qua API backend
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = await getAuthHeaderServer();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}
