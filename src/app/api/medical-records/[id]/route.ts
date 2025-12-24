// src/app/api/medical-records/[id]/route.ts
import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";

// 🔍 GET - Lấy chi tiết hồ sơ y tế theo ID
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const headers = await getAuthHeaderServer();

        const res = await fetch(`${API_URL}/api/medical-records/${id}`, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (GET medical record ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: "Không tìm thấy hồ sơ y tế", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("GET /api/medical-records/[id] exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

// ✏️ PUT - Cập nhật hồ sơ y tế
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const res = await fetch(`${API_URL}/api/medical-records/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (PUT medical record ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: `Không thể cập nhật hồ sơ y tế ${id}`, detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("PUT /api/medical-records/[id] exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

// ❌ DELETE - Xóa hồ sơ y tế
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const headers = await getAuthHeaderServer();
        const { searchParams } = new URL(req.url);
        const hard = searchParams.get("hard");
        // Forward the hard query param to backend if present
        let url = `${API_URL}/api/medical-records/${id}`;
        if (hard === "true") url += `?hard=true`;

        const res = await fetch(url, {
            method: "DELETE",
            headers,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (DELETE medical record ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: `Không thể xóa hồ sơ y tế ${id}`, detail: text },
                { status: res.status }
            );
        }

        return NextResponse.json({ message: "Xóa hồ sơ y tế thành công" });
    } catch (err: any) {
        console.error("DELETE /api/medical-records/[id] exception:", err);
        return NextResponse.json(
            { error: err.message || "Lỗi hệ thống" },
            { status: 500 }
        );
    }
}

