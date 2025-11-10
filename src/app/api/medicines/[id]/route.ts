import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const MEDICINES_URL = `${API_URL}/api/medicines`;

// 🔍 GET - Lấy chi tiết thuốc
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const headers = await getAuthHeaderServer();

        const res = await fetch(`${MEDICINES_URL}/${id}`, { cache: "no-store", headers });
        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (GET medicine ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: "Không tìm thấy thuốc", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("GET /api/medicines/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

// ✏️ PUT - Cập nhật thuốc
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const res = await fetch(`${MEDICINES_URL}/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();

            console.error(`External API (PUT medicine ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: `Không thể cập nhật thuốc ${id}`, detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("PUT /api/medicines/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

// ❌ DELETE - Xóa thuốc
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const headers = await getAuthHeaderServer();

        const res = await fetch(`${MEDICINES_URL}/${id}`, { method: "DELETE", headers });
        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (DELETE medicine ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: `Không thể xóa thuốc ${id}`, detail: text },
                { status: res.status }
            );
        }
        return NextResponse.json({ message: "Xóa thuốc thành công" });
    } catch (err: any) {
        console.error("DELETE /api/medicines/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

