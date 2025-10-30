// src/app/api/login/route.ts
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = new NextResponse();

  try {
    const { username, password } = await req.json();

    // Gọi API backend thật sự (mock URL)
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || "Đăng nhập thất bại" },
        { status: backendRes.status }
      );
    }

    // Lưu user vào session
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.user = {
      id: data.user.id,
      username: data.user.username,
      role: data.user.role,
      token: data.token,
    };
    await session.save();

    // Trả JSON có cả token để frontend lưu
    return NextResponse.json(
      {
        message: "Đăng nhập thành công",
        user: session.user,
        token: data.token, // <— thêm dòng này
      },
      { headers: res.headers }
    );
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
