import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    // ✅ Bắt lỗi nếu backend trả về HTML (ví dụ 404 hoặc 500)
    if (!response.ok) {
      let message = text;
      try {
        const json = JSON.parse(text);
        message = json.error || message;
      } catch {
        // nếu là HTML (<!DOCTYPE html>), trả nguyên text
      }
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
