import { NextResponse } from "next/server";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const APPOINTMENTS_URL = `${API_URL}/api/appointments`;

// 🔍 GET - Lấy chi tiết lịch hẹn
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const headers = await getAuthHeaderServer();

        const res = await fetch(`${APPOINTMENTS_URL}/${id}`, { cache: "no-store", headers });
        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (GET appointment ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: "Không tìm thấy lịch hẹn", detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("GET /api/appointments/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

// ✏️ PUT - Cập nhật lịch hẹn
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const headers = {
            ...await getAuthHeaderServer(),
            "Content-Type": "application/json",
        };

        const res = await fetch(`${APPOINTMENTS_URL}/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();

            console.error(`External API (PUT appointment ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: `Không thể cập nhật lịch hẹn ${id}`, detail: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("PUT /api/appointments/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

// ❌ DELETE - Xóa lịch hẹn
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const headers = await getAuthHeaderServer();

        const res = await fetch(`${APPOINTMENTS_URL}/${id}`, { method: "DELETE", headers });
        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (DELETE appointment ${id}) error:`, res.status, text);
            return NextResponse.json(
                { error: `Không thể xóa lịch hẹn ${id}`, detail: text },
                { status: res.status }
            );
        }
        return NextResponse.json({ message: "Xóa lịch hẹn thành công" });
    } catch (err: any) {
        console.error("DELETE /api/appointments/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

