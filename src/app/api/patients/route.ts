// app/api/patients/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = "http://localhost:5050/api/patients";

// 📦 GET - Lấy danh sách bệnh nhân
export async function GET() {
    try {
        const headers = await getAuthHeaderServer(); // ✅ lấy token từ session
        const res = await fetch(API_URL, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET patients) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách bệnh nhân", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();

        // ✅ đảm bảo trả về mảng
        const list = Array.isArray(data) ? data : data.patients || [];
        return NextResponse.json(list);
    } catch (err: any) {
        console.error("GET /api/patients exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

// 🧩 POST - Thêm bệnh nhân mới
export async function POST(req: Request) {
    try {
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const body = await req.json();
        const res = await fetch(API_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST patient) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể tạo bệnh nhân", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/patients exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}
