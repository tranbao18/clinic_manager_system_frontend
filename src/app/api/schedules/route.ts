// src/app/api/schedules/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = "http://localhost:5050/api/schedules";

// GET /api/schedules - Lấy danh sách lịch trực
export async function GET(req: Request) {
    try {
        const headers = await getAuthHeaderServer();
        const { searchParams } = new URL(req.url);
        const employee_id = searchParams.get("employee_id");

        const url = employee_id ? `${API_URL}/${employee_id}` : API_URL;
        const res = await fetch(url, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET schedules) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách lịch trực", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("GET /api/schedules exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

// POST /api/schedules - Tạo/cập nhật lịch trực (chỉ Admin)
export async function POST(req: Request) {
    try {
        const headers = await getAuthHeaderServer();
        const body = await req.json();

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST schedules) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể tạo/cập nhật lịch trực", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("POST /api/schedules exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

