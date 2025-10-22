import { NextResponse } from "next/server";

const API_URL = "https://68efe26cb06cc802829f0c31.mockapi.io/patients";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params; // 👈 BẮT BUỘC await ở đây

        console.log("📡 API HIT /api/patients/[id] with ID:", id);

        const res = await fetch(`${API_URL}/${id}`, { cache: "no-store" });
        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (GET patient ${id}) error:`, res.status, text);
            return NextResponse.json({ error: `Không tìm thấy bệnh nhân ${id}`, detail: text }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("GET /api/patients/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params; // 👈 await ở đây

        const body = await req.json();
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (PATCH patient ${id}) error:`, res.status, text);
            return NextResponse.json({ error: `Không thể cập nhật bệnh nhân ${id}`, detail: text }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("PATCH /api/patients/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params; // 👈 await ở đây

        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const text = await res.text();
            console.error(`External API (DELETE patient ${id}) error:`, res.status, text);
            return NextResponse.json({ error: `Không thể xóa bệnh nhân ${id}`, detail: text }, { status: res.status });
        }

        return NextResponse.json({ message: "Xóa bệnh nhân thành công" });
    } catch (err: any) {
        console.error("DELETE /api/patients/[id] exception:", err);
        return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
    }
}
