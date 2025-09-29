// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    console.log("🔍 Middleware running at:", pathname);

    // 1. Luôn redirect "/" -> "/auth/login"
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // 2. Bỏ qua các route public
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/api/auth")
    ) {
        return NextResponse.next();
    }

    // 3. Kiểm tra session cookie
    const sessionCookie = req.cookies.get("myapp_session");

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

// Áp dụng middleware cho tất cả route trừ file tĩnh
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
