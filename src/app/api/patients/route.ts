// app/api/patients/route.ts
import { NextResponse } from "next/server";

const API_URL = "https://68efe26cb06cc802829f0c31.mockapi.io/patients";

export async function GET() {
    try {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET patients) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách bệnh nhân", detail: text },
                { status: res.status }
            );
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("GET /api/patients exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST patients) error:", res.status, text);
            return NextResponse.json({ error: "Không thể tạo bệnh nhân", detail: text }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/patients exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}
