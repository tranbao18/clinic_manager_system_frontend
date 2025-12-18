// src/app/api/reports/medicine/inventory/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";

// 📦 GET - Tồn kho từng loại thuốc
export async function GET() {
    try {
        const authHeaders = await getAuthHeaderServer();
        const headers: Record<string, string> = {};
        if (authHeaders.Authorization) {
            headers.Authorization = authHeaders.Authorization;
        }

        const url = `${API_URL}/api/reports/medicine/inventory`;
        const res = await fetch(url, { cache: "no-store", headers });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET medicine inventory) error:", res.status, text);
            return NextResponse.json({ error: "Không thể lấy tồn kho thuốc", detail: text }, { status: res.status });
        }

        const data = await res.json();
        // Backend trả { success, data }
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("GET /api/reports/medicine/inventory exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}
