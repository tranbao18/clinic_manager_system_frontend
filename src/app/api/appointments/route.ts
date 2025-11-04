// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer"; // ✅ thêm dòng này để dùng hàm lấy token

const API_URL = "http://localhost:5050/api/appointments/";

export async function GET() {
    try {
        // ✅ Lấy token từ session hoặc cookie
        const headers = await getAuthHeaderServer();

        // ✅ Gọi API backend với token
        const res = await fetch(API_URL, {
            cache: "no-store",
            headers,
        });

        // ❌ Nếu lỗi từ backend, log ra chi tiết
        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET appointments) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách lịch hẹn", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        // ✅ Đảm bảo luôn trả về mảng (phòng trường hợp backend trả object)
        const list = Array.isArray(data) ? data : data.appointments || [];
        return NextResponse.json(list);
    } catch (err: any) {
        console.error("GET /api/appointments exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}
