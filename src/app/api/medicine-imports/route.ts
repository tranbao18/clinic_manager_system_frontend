// src/app/api/medicine-imports/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const MEDICINE_IMPORTS_URL = `${API_URL}/api/medicine-imports`;

// 📦 GET - Lấy danh sách nhập thuốc
export async function GET() {
    try {
        const headers = await getAuthHeaderServer();
        const res = await fetch(MEDICINE_IMPORTS_URL, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET medicine-imports) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách nhập thuốc", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.medicineImports || [];
        return NextResponse.json(list);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi hệ thống";
        console.error("GET /api/medicine-imports exception:", err);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

// ➕ POST - Tạo nhập thuốc mới
export async function POST(req: Request) {
    try {
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const body = await req.json();
        const res = await fetch(MEDICINE_IMPORTS_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST medicine-import) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể tạo nhập thuốc", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi hệ thống";
        console.error("POST /api/medicine-imports exception:", err);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

