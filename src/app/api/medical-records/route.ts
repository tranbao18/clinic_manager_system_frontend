// src/app/api/medical-records/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const MEDICAL_RECORDS_URL = `${API_URL}/api/medical-records`;

// 📦 GET - Lấy danh sách hồ sơ y tế
export async function GET() {
    try {
        const headers = await getAuthHeaderServer();
        const res = await fetch(MEDICAL_RECORDS_URL, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (GET medical records) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể lấy danh sách hồ sơ y tế", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.medicalRecords || [];
        return NextResponse.json(list);
    } catch (err: any) {
        console.error("GET /api/medical-records exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

// ➕ POST - Tạo hồ sơ y tế mới
export async function POST(req: Request) {
    try {
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const body = await req.json();
        const res = await fetch(MEDICAL_RECORDS_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("External API (POST medical record) error:", res.status, text);
            return NextResponse.json(
                { error: "Không thể tạo hồ sơ y tế", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/medical-records exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

