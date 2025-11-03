// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(req: Request) {
    const res = new NextResponse();

    try {
        // Lấy token từ session hoặc Authorization header
        const session = await getIronSession<SessionData>(req, res, sessionOptions);
        const token = session.user?.token;

        // Nếu có token, gọi API backend để logout
        if (token) {
            const backendRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!backendRes.ok) {
                const data = await backendRes.json().catch(() => ({}));
                console.error("Backend logout error:", data);
                // Tiếp tục xóa session dù backend có lỗi
            }
        }

        // Xóa session
        session.destroy();

        return NextResponse.json(
            { success: true, message: "Đăng xuất thành công" },
            { headers: res.headers }
        );
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Logout route error:", err);

        // Vẫn cố gắng xóa session nếu có lỗi
        try {
            const session = await getIronSession<SessionData>(req, res, sessionOptions);
            session.destroy();
        } catch {
            // Ignore errors when destroying session
        }

        return NextResponse.json(
            { error: error.message || "Lỗi khi đăng xuất" },
            { status: 500, headers: res.headers }
        );
    }
}

